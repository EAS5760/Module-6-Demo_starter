const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send(`<h1>CORS Demo</h1>
    <p>This calls /health so JWT authentication does not affect the CORS demo.</p>
    <button id="load">Call API</button><pre id="result"></pre>
    <script>
      document.querySelector('#load').onclick = async () => {
        const output = document.querySelector('#result');
        try {
          const response = await fetch('http://localhost:3000/health?t=' + Date.now(), { cache: 'no-store' });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          output.textContent = JSON.stringify(await response.json(), null, 2);
        } catch (error) {
          output.textContent = error.message;
          console.error(error);
        }
      };
    </script>`);
});
app.listen(5500, () => console.log("Demo frontend: http://localhost:5500"));
