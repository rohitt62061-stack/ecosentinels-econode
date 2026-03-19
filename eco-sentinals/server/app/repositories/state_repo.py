from typing import Dict, Any, Optional

class StateRepository:
    """
    Manages the mock state for multiple wards.
    In a production app, this would interact with a database (e.g., Firebase, Postgres).
    """
    def __init__(self):
        # schema: { "ward_id": { "command": "IDLE", "sensor_data": {} } }
        self._state: Dict[str, Dict[str, Any]] = {}

    def get_ward_state(self, ward_id: str) -> Dict[str, Any]:
        """Returns the state for a specific ward, initializing if missing."""
        if ward_id not in self._state:
            self._state[ward_id] = {
                "command": "IDLE",
                "sensor_data": {}
            }
        return self._state[ward_id]

    def update_sensor_data(self, ward_id: str, data: Dict[str, Any]) -> None:
        """Updates sensor data for a ward."""
        state = self.get_ward_state(ward_id)
        state["sensor_data"] = data

    def update_command(self, ward_id: str, command: str) -> None:
        """Updates command for a ward."""
        state = self.get_ward_state(ward_id)
        state["command"] = command

    def get_command(self, ward_id: str) -> str:
        """Gets command for a ward."""
        return self.get_ward_state(ward_id).get("command", "IDLE")

# Singleton Instance
state_repo = StateRepository()

def get_state_repo() -> StateRepository:
    """Dependency injection provider."""
    return state_repo
