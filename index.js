const { fetchImages } = require('./fetchImages')
const { imageProcessor } = require('./imageProcessor')
const { is_function_running, updateFunctionStatus } = require('./database/index')
const { logger } = require('./config')
const fs = require('fs');
const path = require('path');

function isDirectoryEmptySync(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (error) {
    console.error("Error reading directory:", error.message);
    return false; // Handle as not empty in case of an error
  }
}

const run_process = async () => {
    try {
        const functionStatus = await is_function_running('general_process')

        if(functionStatus) {
            throw new Error('Process is already running')
        }

        await updateFunctionStatus('general_process', 1)

        await fetchImages()

        const directoryPath = path.join(__dirname, 'raw');
        const isEmpty = isDirectoryEmptySync(directoryPath);
        
        // console.log(isEmpty ? "Directory is empty" : "Directory is not empty");
        logger.error(isEmpty ? "Directory is empty" : "Directory is not empty", {timestamp: new Date().toLocaleString()})

        if(!isEmpty){
            await imageProcessor()
        }

        await updateFunctionStatus('general_process', 0)
        
        // console.log('done')
        logger.info('DONE', {timestamp: new Date().toLocaleString()})

        process.exit(0);
    } catch (error) {
        console.log(`Error ${error.message}`)
        logger.error(error.message, {timestamp: new Date().toLocaleString()})
        
        process.exit(1);
    }
    
}

run_process()