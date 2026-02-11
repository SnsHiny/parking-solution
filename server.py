import http.server
import socketserver
import threading
import time

PORT = 5000

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # 禁用日志输出，减少控制台混乱
        pass

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"服务器运行在 http://localhost:{PORT}")
        print("按 Ctrl+C 停止服务器")
        httpd.serve_forever()

if __name__ == "__main__":
    # 在后台线程中启动服务器
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # 主线程保持运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("服务器停止")
