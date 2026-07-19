import os
import shutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
from fastapi import Response

from graph import app_graph
app = FastAPI(title="AI Referee Crew API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(uploads_path, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "url": f"http://localhost:8000/uploads/{file.filename}", "path": file_path}


class EvaluateRequest(BaseModel):
    input_type: str = "text"
    incident_data: str

@app.get("/api/graph_image")
async def get_graph_image():
    try:
        png_data = app_graph.get_graph().draw_mermaid_png()
        return Response(content=png_data, media_type="image/png")
    except Exception as e:
        return Response(content=str(e), status_code=500)

@app.post("/api/evaluate_baseline")
async def evaluate_baseline(req: EvaluateRequest):
    # Simulate single agent baseline
    from agents import get_llm
    from langchain_core.messages import HumanMessage
    
    llm = get_llm()
    response = llm.invoke([
        HumanMessage(content=f"You are a football referee. Analyze this incident and give your decision with confidence score: {req.incident_data}")
    ])
    
    return {
        "baseline_decision": response.content
    }

@app.websocket("/ws/evaluate")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        req = json.loads(data)
        input_type = req.get("input_type", "text")
        incident_data_str = req.get("incident_data", "")
        text_description_str = req.get("text_description", None)
        
        # Initialize state
        state = {
            "input_type": input_type,
            "raw_incident": incident_data_str,
            "text_description": text_description_str,
            "parsed_incident": None,
            "incident_type": "",
            "agents_to_launch": [],
            "initial_opinions": {},
            "current_opinions": {},
            "debate_history": [],
            "final_decision": None,
            "messages": []
        }
        
        # Stream the graph execution
        # Use astream_events or simply astream to yield state updates
        async for output in app_graph.astream(state):
            # output is a dict with node name as key and state update as value
            for node_name, state_update in output.items():
                if not state_update:  # Guard against None or empty updates
                    continue
                if "messages" in state_update:
                    # Send the latest messages to the client
                    for msg in state_update["messages"]:
                        await websocket.send_json({
                            "type": "agent_message",
                            "node": node_name,
                            "message": msg
                        })
                        await asyncio.sleep(0.5) # Slight delay for visual effect
                
                if "final_decision" in state_update:
                    await websocket.send_json({
                        "type": "final_decision",
                        "decision": state_update["final_decision"]
                    })
                    
        await websocket.send_json({"type": "done"})
        
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        import traceback
        traceback.print_exc()
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
