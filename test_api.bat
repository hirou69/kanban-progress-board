@echo off
chcp 65001 >nul
echo === Test 1: GET /api/cards (should be empty or have data) ===
curl -s http://localhost:3000/api/cards
echo.
echo.

echo === Test 2: POST /api/cards (create a card) ===
curl -s -X POST http://localhost:3000/api/cards -H "Content-Type: application/json" -d "{\"id\":\"test1\",\"companyName\":\"Test Corp\",\"siteName\":\"Sato House\",\"productName\":\"Inplus Window\",\"constructionDate\":\"2026-03-01\",\"arrivalDate\":\"2026-02-27\",\"status\":\"estimate_request\",\"notes\":\"test note\"}"
echo.
echo.

echo === Test 3: GET /api/cards (should have 1 card) ===
curl -s http://localhost:3000/api/cards
echo.
echo.

echo === Test 4: PUT /api/cards/test1 (update status) ===
curl -s -X PUT http://localhost:3000/api/cards/test1 -H "Content-Type: application/json" -d "{\"id\":\"test1\",\"companyName\":\"Test Corp\",\"siteName\":\"Sato House\",\"productName\":\"Inplus Window\",\"constructionDate\":\"2026-03-01\",\"arrivalDate\":\"2026-02-27\",\"status\":\"estimating\",\"notes\":\"updated note\"}"
echo.
echo.

echo === Test 5: GET /api/cards (status should be estimating) ===
curl -s http://localhost:3000/api/cards
echo.
echo.

echo === Test 6: DELETE /api/cards/test1 ===
curl -s -X DELETE http://localhost:3000/api/cards/test1
echo.
echo.

echo === Test 7: GET /api/cards (should be empty) ===
curl -s http://localhost:3000/api/cards
echo.
echo.

echo === All tests completed ===
