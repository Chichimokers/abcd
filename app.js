const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const GITLAB_URL = 'https://codecomunidades.prod.uci.cu';
const REPO_PATH = 'antonioc/docker-images';
const ACCESS_TOKEN = 'WDg6qtdPt2f99iB3XtyA';  // Cambia esto por tu token de acceso
const BRANCH = 'master';  // Cambia esto si usas otra rama

// Obtener los argumentos de la línea de comandos
const args = process.argv.slice(2);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Deshabilitar verificación de SSL

// Verificar si se han pasado archivos
if (args.length === 0) {
    console.log('Por favor, arrastra y suelta uno o más archivos sobre este script.');
    process.exit(1);
}

// Función para subir el archivo
async function uploadFile(filePath) {
    try {
        const fileName = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    
        // Hacer la solicitud para subir el archivo
        const response = await axios.put(
            `${GITLAB_URL}/api/v4/projects/${encodeURIComponent(REPO_PATH)}/repository/files/${encodeURIComponent(fileName)}`,
            {
                branch: BRANCH,
                content: fileContent,
                commit_message: `Subida de archivo: ${fileName}`
            },
            {
                headers: {
                    'PRIVATE-TOKEN': ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Archivo subido exitosamente: ${fileName}`);
    } catch (error) {
        if (error.response) {
            console.error(`Error al subir el archivo ${filePath}:`, error.response.data);
            console.error('Código de estado:', error.response.status);
        } else {
            console.error(`Error al subir el archivo ${filePath}:`, error.message);
        }
    }
}

// Procesar cada archivo pasado como argumento
async function processFiles() {
    for (const filePath of args) {
        const absolutePath = path.resolve(filePath);
     
        // Verificar si el archivo existe
        if (fs.existsSync(absolutePath)) {
            await uploadFile(absolutePath);
        } else {
            console.error(`El archivo no existe: ${absolutePath}`);
        }
    }
}

// Ejecutar la función para procesar los archivos
processFiles();
