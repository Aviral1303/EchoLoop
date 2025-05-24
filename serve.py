#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3001

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept")
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle OPTIONS request for CORS preflight
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        # Serve the gmail-test.html file at the root URL
        if self.path == '/' or self.path == '':
            self.path = '/gmail-test.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

print(f"Starting server at http://localhost:{PORT}")
print(f"You can access gmail-test.html at http://localhost:{PORT}/")
print("Press Ctrl+C to stop the server")

# Change to the directory containing the script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
    httpd.serve_forever() 