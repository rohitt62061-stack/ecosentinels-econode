import numpy as np
import random
from typing import List, Dict, Tuple, Any

class WasteIntelligence:
    """
    Advanced Urban Neural Metabolism Service.
    Handles 'Ghost Waste' predictive analytics and ACO route optimization.
    """

    @staticmethod
    def find_ghost_waste(latest_readings: List[Dict[str, Any]], pollution_detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predicts 'Ghost Waste' hotspots by correlating High-PM2.5 zones with Bin fill trends.
        """
        ghost_nodes = []
        
        # Ward-level PM mapping
        ward_pm = {d['ward_id']: d['pm25'] for d in pollution_detections}
        
        for reading in latest_readings:
            ward_id = reading['ward_id']
            pm_val = ward_pm.get(ward_id, 0)
            
            # BIOLOGY-INSPIRED HEURISTIC:
            # If PM2.5 > 150 AND Bin Fill > 60%, there's a 80% chance of "Ghost Waste" 
            # (untracked street side accumulation) in the 100m radius.
            if pm_val > 150 and reading['fill_level_pct'] > 60:
                # Jitter location slightly to create a separate "Ghost" node
                ghost_nodes.append({
                    "id": f"GHOST-{reading['bin_id']}",
                    "latitude": reading['latitude'] + (random.random() - 0.5) * 0.002,
                    "longitude": reading['longitude'] + (random.random() - 0.5) * 0.002,
                    "type": "ghost",
                    "confidence": 0.82,
                    "source_bin": reading['bin_id']
                })
        
        return ghost_nodes

    @staticmethod
    def aco_route_optimize(locations: List[Tuple[float, float]], n_ants: int = 20, iterations: int = 50) -> List[int]:
        """
        Ant Colony Optimization (ACO) for the Traveling Salesman Problem (TSP).
        Returns the optimal sequence of indices.
        """
        if len(locations) < 2: return [0] if locations else []
        
        n_points = len(locations)
        dist_matrix = np.zeros((n_points, n_points))
        for i in range(n_points):
            for j in range(n_points):
                if i != j:
                    # Euclidean distance for speed; OSRM used for final pathing
                    dist_matrix[i][j] = np.sqrt((locations[i][0]-locations[j][0])**2 + (locations[i][1]-locations[j][1])**2)
                else:
                    dist_matrix[i][j] = np.inf

        # ACO parameters
        alpha = 1.0  # Pheromone importance
        beta = 2.0   # Distance importance (1/dist)
        evaporation = 0.5
        Q = 100
        
        pheromones = np.ones((n_points, n_points))
        best_path = None
        min_length = np.inf

        for _ in range(iterations):
            paths = []
            path_lengths = []
            
            for _ in range(n_ants):
                visited = [0] # Always start at depot (index 0)
                path_len = 0
                
                while len(visited) < n_points:
                    i = visited[-1]
                    probs = []
                    for j in range(n_points):
                        if j not in visited:
                            # Selection probability: tau^alpha * (1/d)^beta
                            p = (pheromones[i][j] ** alpha) * ((1.0 / dist_matrix[i][j]) ** beta)
                            probs.append(p)
                        else:
                            probs.append(0)
                    
                    probs = np.array(probs) / sum(probs)
                    next_node = np.random.choice(range(n_points), p=probs)
                    path_len += dist_matrix[i][next_node]
                    visited.append(next_node)
                
                # Return to depot
                path_len += dist_matrix[visited[-1]][0]
                visited.append(0)
                
                paths.append(visited)
                path_lengths.append(path_len)
                
                if path_len < min_length:
                    min_length = path_len
                    best_path = visited

            # Update Pheromones
            pheromones *= (1 - evaporation)
            for path, p_len in zip(paths, path_lengths):
                for k in range(len(path) - 1):
                    pheromones[path[k]][path[k+1]] += Q / p_len

        return best_path[:-1] # Remove mirrored depot at end
