const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const searchString = `                } catch (error) {
                    if (errorEl) {
                        errorEl.innerText = error.message;
                        errorEl.classList.remove('hidden');
                    }
                } finally {`;
const replaceString = `                } catch (error) {
                    if (errorEl) {
                        errorEl.innerText = error.message;
                        errorEl.classList.remove('hidden');
                    }
                    if (userId.toLowerCase() === 'admin' || userId.toLowerCase() === 'identify.jvd@gmail.com') {
                        adminFailedAttempts++;
                        if (adminFailedAttempts >= 2) {
                            const forgotContainer = document.getElementById('forgot-password-container');
                            if (forgotContainer) forgotContainer.classList.remove('hidden');
                        }
                    } else {
                        const forgotContainer = document.getElementById('forgot-password-container');
                        if (forgotContainer) forgotContainer.classList.add('hidden');
                    }
                } finally {`;

if (content.includes(searchString)) {
    content = content.replace(searchString, replaceString);
    fs.writeFileSync('index.html', content);
    console.log('Catch block fixed successfully');
} else {
    console.log('Search string not found in catch block!');
}
