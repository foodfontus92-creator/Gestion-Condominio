"""API tests for Condominio 3D Dashboard backend."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_list_buildings():
    r = client.get("/api/buildings")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    assert all(b["status"] == "active" for b in data)


def test_create_building():
    r = client.post("/api/buildings", json={"code": "F"})
    assert r.status_code == 201
    assert r.json()["code"] == "F"


def test_duplicate_building():
    client.post("/api/buildings", json={"code": "G"})
    r = client.post("/api/buildings", json={"code": "G"})
    assert r.status_code == 409


def test_suppress_building():
    # create building H
    r = client.post("/api/buildings", json={"code": "H"})
    bldg_id = r.json()["id"]
    r = client.patch(f"/api/buildings/{bldg_id}/suppress")
    assert r.status_code == 200
    assert r.json()["status"] == "suppressed"


def test_list_apartments():
    r = client.get("/api/apartments")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 45  # 5 buildings x 9 apartments
