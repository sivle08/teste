import subprocess
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def styles():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def scripts():
    return send_from_directory('.', 'script.js')

@app.route('/runcode', methods=['POST'])
def run_code():
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({'error': 'No code provided'}), 400

    try:
        # Execute the code using subprocess
        # We use a timeout to prevent runaway processes in a more robust scenario.
        # For simplicity here, we'll keep it straightforward.
        process = subprocess.run(
            ['python', '-c', code],
            capture_output=True,
            text=True,
            timeout=10  # Timeout in seconds
        )
        output = process.stdout
        error = process.stderr

        if error:
            # If there's an error, return it
            return jsonify({'output': output, 'error': error})
        return jsonify({'output': output})

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out after 10 seconds.'}), 408
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
