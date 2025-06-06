document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput');
    const runButton = document.getElementById('runButton');
    const outputArea = document.getElementById('outputArea');

    runButton.addEventListener('click', () => {
        const code = codeInput.value;
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
                // If the server response is not ok, try to get error text
                return response.text().then(text => {
                    throw new Error(`Server error: ${response.status} ${response.statusText}. ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.output) {
                outputArea.textContent = data.output;
            } else if (data.error) {
                outputArea.textContent = 'Error: ' + data.error;
            } else {
                outputArea.textContent = 'No output received.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            outputArea.textContent = 'Failed to run code. ' + error.message;
        });
    });
});
