#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os

PORT = 8008

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"🚀 Guide de Lyon v8 launched at http://localhost:{PORT}")
    webbrowser.open(f'http://localhost:{PORT}')
    httpd.serve_forever()