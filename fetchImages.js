const { Builder, Browser, By, Key, until, Options } = require('selenium-webdriver')
const {
  username,
  password,
  cookies
} = require('./ig_dummy_users/listandlike_1')
const {run} = require('./getPostData')
const fs = require('fs');
const chrome = require('selenium-webdriver/chrome');
const { logger } = require('./config')

let driver = null

const fetchImages = async () => {
  try {
    let options = new chrome.Options()
    options.addArguments('--headless=new')
    
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build()

      cookies.forEach(element => {
        driver.manage().addCookie({
          name: element.name,
          value: element.value,
          path: element.path,
          domain: element.domain,
          secure: element.secure,
          httpOnly: element.httpOnly,
          expiry: element.expirationDate,
          sameSite: element.sameSite
        })
      })

      try {
        await driver.get('https://www.instagram.com/')
        await loginIfPageIsLoginPage()
        await skipSaveLoginInfo()
        await turnOffNotification()
  
        await getImage()
  
      } finally {
        await driver.quit()
      }
    
  } catch (error) {
    console.log(`Error | fetchImages | ${error.message}`)
    logger.error(`Error | fetchImages | ${error.message}`, {timestamp: new Date().toLocaleString()})

  }

}

function waitFewSeconds(millesec) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("Few Seconds have passed.");
    }, millesec ?? 10000); 
  });
}

const getImage = async () => {
  await waitFewSeconds()

  const posts = await run() ?? false

  if(!posts){
    return
  }

  let counter = 0

  for await (const doc of posts) {
    await waitFewSeconds(2000)

    try{
      
      counter++
  
      let imgURL = doc.displayUrl
      let post_id = doc.post_id
  
      let imageName = `img___${post_id}`
  
      await driver.executeScript('window.open()');
  
      let tabs = await driver.getAllWindowHandles();
  
      await driver.switchTo().window(tabs[tabs.length - 1]);
      await driver.get(imgURL);
  
      let base64Image = await driver.executeScript(`
        let img = document.querySelector('img');
        let canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/jpeg').split(',')[1];  // Get base64 content after the 'data:image/jpeg;base64,' prefix
      `);
  
      // Step 4: Convert the Base64 string back to binary and save locally
      fs.writeFileSync(`raw/${imageName}.jpg`, base64Image, 'base64');
  
      console.log(`Image saved as "raw/${imageName}.jpg".`); 
      logger.info(`Image saved as "raw/${imageName}.jpg".`, {timestamp: new Date().toLocaleString()})

    }catch(e){
      console.log(e.message)
      logger.error(e.message, {timestamp: new Date().toLocaleString()})

    }

  }

  // console.log(counter)
}

const loginIfPageIsLoginPage = async () => {
  await waitFewSeconds()

  await driver.findElement(By.css("input[name='username']")).then((el) => {
    el.clear()
    el.sendKeys(username)
    console.log('username added')
  })

  await driver.findElement(By.css("input[name='password']")).then((el) => {
    el.clear()
    el.sendKeys(password)
    console.log('password added')
  })

  await driver.findElement(By.css("button[type='submit']")).then((el) => {
    el.click()
  })
}

const skipSaveLoginInfo = async () => {
  try {
    await waitFewSeconds(20000)
  
    await driver.findElement(By.xpath(`//div[contains(text(), 'Not now')]`)).then((el) => {
      el.click()
    }).catch((err) => {
      console.log(err)
      logger.error(err.message, {timestamp: new Date().toLocaleString()})
  
    })
    
  } catch (error) {
    logger.error(error.message, {timestamp: new Date().toLocaleString()})
  }

}

const turnOffNotification = async () => {
  try {
    await waitFewSeconds(20000)
  
    await driver.findElement(By.xpath(`//button[contains(text(), 'Not Now')]`)).then((el) => {
      el.click()
    }).catch((err) => {
      console.log(err)
      logger.error(err.message, {timestamp: new Date().toLocaleString()})
  
    })
    
  } catch (error) {
    logger.error(error.message, {timestamp: new Date().toLocaleString()})
    
  }

}

// fetchImages()

module.exports = {
  fetchImages
}
