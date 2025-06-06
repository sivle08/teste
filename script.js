document.addEventListener('DOMContentLoaded', () => {
    // const codeInput = document.getElementById('codeInput'); // No longer directly used to get value
    const runButton = document.getElementById('runButton');
    const outputArea = document.getElementById('outputArea');

    // Ensure 'editor' is available (it's initialized in index.html before this script)
    if (typeof editor === 'undefined') {
        console.error('CodeMirror editor not found. Make sure it is initialized before script.js');
        outputArea.textContent = 'Error: Code editor not initialized.';
        return;
    }

    runButton.addEventListener('click', () => {
        const code = editor.getValue(); // Get code from CodeMirror instance
        outputArea.textContent = 'Running code...'; // Provide immediate feedback

        fetch('/runcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server error: ${response.status} ${response.statusText}. ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.output && !data.error) { // Only output if no error
                outputArea.textContent = data.output;
            } else if (data.error) {
                // Display both stdout (if any) and stderr if stderr has content
                let resultText = 'Error: ' + data.error;
                if (data.output && data.output.trim() !== '') { // Add stdout if it's not empty
                    resultText = data.output.trim() + "\n" + resultText;
                }
                outputArea.textContent = resultText;
            } else if (data.output) { // Fallback for output if error field is missing but output is there
                outputArea.textContent = data.output;
            }
            else {
                outputArea.textContent = 'No output received.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            outputArea.textContent = 'Failed to run code. ' + error.message;
        });
    });
});
