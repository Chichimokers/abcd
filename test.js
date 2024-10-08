const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const GITLAB_URL = 'https://codecomunidades.prod.uci.cu'; // URL del servidor GitLab
const REPO_PATH = 'antonioc/docker-images'; // Ruta del repositorio
const USER = 'antonioc';  // Tu nombre de usuario
const PASS = '291203Er*-';  // Tu contraseña
const BRANCH = 'main';  // Rama a la que deseas subir los archivos

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
        const fileStream = fs.createReadStream(filePath);
    
        // Crear el formulario
        const formData = new FormData();
        formData.append('file', fileStream, { filename: fileName });

        // Autenticación básica
        const auth = {
            username: USER,
            password: PASS,
        };

        // Hacer la solicitud para subir el archivo
        const response = await axios.put(
            `${GITLAB_URL}/api/v4/projects/${encodeURIComponent(REPO_PATH)}/repository/files/${encodeURIComponent(fileName)}?branch=${BRANCH}&commit_message=Subida%20de%20archivo`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
                auth: auth,
            }
        );

        console.log(`Archivo subido exitosamente: ${fileName}`);
    } catch (error) {
        if (error.response) {
            console.error(`Error al subir el archivo ${filePath}:`, error.response.data);
            console.error('Código de estado:', error.response.status);
            console.error('Encabezados:', error.response.headers);
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