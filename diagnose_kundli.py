#!/usr/bin/env python3
"""
Quick test to verify Brihat Kundli API issue and provide solution
"""

import requests
import json

def test_kundli_endpoint():
    """Test the Kundli endpoint with detailed debugging"""
    
    print("BRIHAT KUNDLI API DIAGNOSIS")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test data
    test_data = {
        "name": "Test User",
        "date": "1990-05-15",
        "time": "14:30", 
        "place": "New Delhi, India"
    }
    
    print("1. Testing server connectivity...")
    try:
        health_response = requests.get(f"{base_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("   [OK] Server is running")
        else:
            print(f"   [ERROR] Server health check failed: {health_response.status_code}")
            return
    except:
        print("   [ERROR] Cannot connect to server")
        return
    
    print("\n2. Checking available routes...")
    try:
        openapi_response = requests.get(f"{base_url}/openapi.json", timeout=5)
        if openapi_response.status_code == 200:
            schema = openapi_response.json()
            paths = list(schema.get("paths", {}).keys())
            
            # Check for kundli endpoint
            kundli_endpoints = [p for p in paths if "kundli" in p.lower()]
            
            if kundli_endpoints:
                print(f"   [OK] Found Kundli endpoints: {kundli_endpoints}")
            else:
                print("   [ERROR] No Kundli endpoints found in API schema")
                print("   Available feature endpoints:")
                feature_endpoints = [p for p in paths if "/api/features/" in p]
                for endpoint in feature_endpoints:
                    print(f"     - {endpoint}")
                
                print("\n   DIAGNOSIS: The Kundli endpoint is not registered in the API")
                print("   SOLUTION: The server needs to be restarted to pick up the route")
                return
    except:
        print("   [ERROR] Cannot check API schema")
        return
    
    print("\n3. Testing Kundli API endpoint...")
    kundli_url = f"{base_url}/api/features/kundli/generate"
    
    try:
        response = requests.post(kundli_url, json=test_data, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("   [SUCCESS] Brihat Kundli API is working!")
            
            # Validate response
            data = response.json()
            required_fields = ["basic_info", "planetary_positions", "predictions", "remedies"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"   [WARNING] Missing fields: {missing_fields}")
            else:
                print("   [OK] Response contains all required fields")
                
            # Show sample data
            basic_info = data.get("basic_info", {})
            print(f"\n   Sample Output:")
            print(f"     Name: {basic_info.get('name', 'N/A')}")
            print(f"     Rashi: {basic_info.get('rashi', 'N/A')}")
            print(f"     Nakshatra: {basic_info.get('nakshatra', 'N/A')}")
            
        elif response.status_code == 405:
            print("   [ERROR] Method Not Allowed")
            print("   DIAGNOSIS: Route exists but POST method not allowed")
            print("   SOLUTION: Check route definition in features.py")
            
        elif response.status_code == 404:
            print("   [ERROR] Endpoint Not Found")
            print("   DIAGNOSIS: Route not registered or server not restarted")
            print("   SOLUTION: Restart the FastAPI server")
            
        elif response.status_code == 422:
            print("   [ERROR] Validation Error")
            print(f"   Details: {response.json()}")
            
        else:
            print(f"   [ERROR] Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("   [ERROR] Request timeout")
    except Exception as e:
        print(f"   [ERROR] Request failed: {e}")

def provide_solution():
    """Provide step-by-step solution"""
    
    print("\n\nSOLUTION STEPS")
    print("=" * 50)
    
    print("The Brihat Kundli API endpoint is not appearing in the server routes.")
    print("This typically happens when:")
    print("1. The server was started before the route was added")
    print("2. There's an import error preventing route registration")
    print("3. The route definition has a syntax error")
    
    print("\nTo fix this issue:")
    print("1. Stop the current FastAPI server (Ctrl+C)")
    print("2. Restart the server:")
    print("   cd BE")
    print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("3. Wait for the server to fully start")
    print("4. Test the API again")
    
    print("\nIf the issue persists:")
    print("1. Check server logs for import errors")
    print("2. Verify the features router is included in main.py")
    print("3. Check if kundli_service imports correctly")

if __name__ == "__main__":
    test_kundli_endpoint()
    provide_solution()