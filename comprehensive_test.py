#!/usr/bin/env python3
"""
Comprehensive test for Brihat Kundli API
"""

import requests
import json
import sys

def test_api_endpoints():
    """Test various API endpoints to check server status"""
    
    base_url = "http://localhost:8000"
    
    print("Testing API Endpoints...")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/health", "Health check"),
        ("GET", "/api/features/horoscope/daily", "Daily horoscope"),
        ("GET", "/api/features/reports/available", "Available reports"),
        ("POST", "/api/features/kundli/generate", "Brihat Kundli generation")
    ]
    
    results = {}
    
    for method, endpoint, description in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"\n{description}:")
        print(f"  {method} {url}")
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                # Test data for Kundli
                test_data = {
                    "name": "Test User",
                    "date": "1990-05-15", 
                    "time": "14:30",
                    "place": "New Delhi, India"
                }
                response = requests.post(url, json=test_data, timeout=10)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                print("  Result: [OK]")
                if endpoint == "/api/features/kundli/generate":
                    # Validate Kundli response structure
                    data = response.json()
                    required_fields = ["basic_info", "planetary_positions", "predictions"]
                    missing = [f for f in required_fields if f not in data]
                    if missing:
                        print(f"  Missing fields: {missing}")
                        results[endpoint] = "PARTIAL"
                    else:
                        print("  All required fields present")
                        results[endpoint] = "OK"
                else:
                    results[endpoint] = "OK"
            elif response.status_code == 405:
                print("  Result: [ERROR] Method Not Allowed")
                results[endpoint] = "METHOD_ERROR"
            elif response.status_code == 422:
                print("  Result: [ERROR] Validation Error")
                print(f"  Details: {response.json()}")
                results[endpoint] = "VALIDATION_ERROR"
            else:
                print(f"  Result: [ERROR] Status {response.status_code}")
                results[endpoint] = "ERROR"
                
        except requests.exceptions.ConnectionError:
            print("  Result: [ERROR] Connection failed")
            results[endpoint] = "CONNECTION_ERROR"
        except requests.exceptions.Timeout:
            print("  Result: [ERROR] Timeout")
            results[endpoint] = "TIMEOUT"
        except Exception as e:
            print(f"  Result: [ERROR] {e}")
            results[endpoint] = "EXCEPTION"
    
    return results

def check_server_routes():
    """Check available routes using FastAPI docs"""
    
    print("\n\nChecking FastAPI Documentation...")
    print("=" * 50)
    
    try:
        # Try to access OpenAPI docs
        docs_url = "http://localhost:8000/docs"
        response = requests.get(docs_url, timeout=5)
        
        if response.status_code == 200:
            print(f"[OK] FastAPI docs available at: {docs_url}")
        else:
            print(f"[ERROR] Cannot access docs: {response.status_code}")
            
        # Try to get OpenAPI schema
        openapi_url = "http://localhost:8000/openapi.json"
        response = requests.get(openapi_url, timeout=5)
        
        if response.status_code == 200:
            schema = response.json()
            paths = schema.get("paths", {})
            
            print(f"\nAvailable API paths ({len(paths)} total):")
            for path, methods in paths.items():
                method_list = list(methods.keys())
                print(f"  {path} - {method_list}")
                
            # Check if our Kundli endpoint exists
            kundli_path = "/api/features/kundli/generate"
            if kundli_path in paths:
                print(f"\n[OK] Kundli endpoint found: {kundli_path}")
                methods = list(paths[kundli_path].keys())
                print(f"     Supported methods: {methods}")
                return True
            else:
                print(f"\n[ERROR] Kundli endpoint not found: {kundli_path}")
                return False
        else:
            print(f"[ERROR] Cannot access OpenAPI schema: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Failed to check routes: {e}")
        return False

def test_kundli_service_directly():
    """Test the Kundli service logic directly"""
    
    print("\n\nTesting Kundli Service Logic...")
    print("=" * 50)
    
    try:
        # Import and test the service directly
        sys.path.append("BE")
        from app.services.kundli_service import kundli_service
        
        test_data = {
            "name": "Test User",
            "date": "1990-05-15",
            "time": "14:30", 
            "place": "New Delhi, India"
        }
        
        print("Testing kundli_service.generate_brihat_kundli()...")
        
        # This is an async function, so we need to handle it properly
        import asyncio
        
        async def test_service():
            result = await kundli_service.generate_brihat_kundli(test_data)
            return result
        
        result = asyncio.run(test_service())
        
        if result and isinstance(result, dict):
            print("[OK] Service returns valid data")
            print(f"     Keys: {list(result.keys())}")
            return True
        else:
            print("[ERROR] Service returns invalid data")
            return False
            
    except ImportError as e:
        print(f"[ERROR] Cannot import service: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Service test failed: {e}")
        return False

def main():
    """Main test function"""
    
    print("Brihat Kundli API Comprehensive Test")
    print("=" * 60)
    
    # Test 1: API Endpoints
    endpoint_results = test_api_endpoints()
    
    # Test 2: Check Routes
    routes_ok = check_server_routes()
    
    # Test 3: Service Logic
    service_ok = test_kundli_service_directly()
    
    # Summary
    print("\n\nTEST SUMMARY")
    print("=" * 60)
    
    kundli_endpoint = "/api/features/kundli/generate"
    kundli_status = endpoint_results.get(kundli_endpoint, "NOT_TESTED")
    
    print(f"Kundli API Status: {kundli_status}")
    print(f"Routes Available: {'YES' if routes_ok else 'NO'}")
    print(f"Service Logic: {'OK' if service_ok else 'ERROR'}")
    
    if kundli_status == "OK":
        print("\n[SUCCESS] Brihat Kundli API is working properly!")
    elif kundli_status == "METHOD_ERROR":
        print("\n[ERROR] Method not allowed - check route definition")
    elif kundli_status == "CONNECTION_ERROR":
        print("\n[ERROR] Cannot connect to server - make sure it's running")
    elif kundli_status == "VALIDATION_ERROR":
        print("\n[ERROR] Input validation failed - check data format")
    else:
        print(f"\n[ERROR] Brihat Kundli API has issues: {kundli_status}")
    
    # Recommendations
    print("\nRECOMMENDATIONS:")
    if not routes_ok:
        print("- Check if the features router is properly included in main.py")
    if not service_ok:
        print("- Check if the kundli_service module is working correctly")
    if kundli_status == "CONNECTION_ERROR":
        print("- Start the backend server: cd BE && python -m uvicorn app.main:app --reload")
    
    return kundli_status == "OK"

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)