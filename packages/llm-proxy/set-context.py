from fastapi import Request, FastAPI
import litellm
import os


NOT_SET = "-not-set"

# Speicher für den aktuellen Feature-Namen
# Wir nutzen eine Datei, damit der Status auch bei Code-Reloads erhalten bleibt
STATE_FILE = "/tmp/current_feature.txt"

def get_feature():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return f.read().strip()
    return NOT_SET

def set_feature(name: str):
    with open(STATE_FILE, "w") as f:
        f.write(name)

# In den LiteLLM Callbacks nutzen wir diesen Wert
def set_context_callback(kwargs, completion_response, start_time, end_time):
    if "metadata" not in kwargs:
        kwargs["metadata"] = {}
    kwargs["metadata"]["feature"] = get_feature()

litellm.input_callback = [set_context_callback]



from litellm.proxy.proxy_server import app 


@app.post("/set-context")
async def set_context(request: Request):
    """
    Endpunkt zum Setzen des aktuellen Feature-Kontexts.
    Beispiel: curl -X POST http://localhost:4000/set-context -d '{"feature": "auth-fix"}'
    """
    try:
        data = await request.json()
        new_feature = data.get("feature", "default")
        set_feature(new_feature)
        return {
            "status": "success", 
            "message": f"Kontext auf '{new_feature}' aktualisiert."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/get-context")
async def get_context():
    """Gibt den aktuell aktiven Kontext zurück."""
    return {"active_feature": get_feature()}

    