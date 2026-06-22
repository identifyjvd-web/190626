const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');

const target = `                } catch (error) {
                    if (errorEl) {
                        errorEl.innerText = error.message;
                        errorEl.classList.remove('hidden');
                    }
                } finally {`;

const replacement = `                } catch (error) {
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

let updated = text.replace(target, replacement);

if (text === updated) {
    console.log("No replacement happened. Let's do it with regex to handle newline differences.");
    
    // We'll replace the text right after 'resetAutoLogoutTimer()' down to 'finally {'
    // which is the end of submitLogin
    const regex = /showTab\('records'\);\s*loadAllData\(\);\s*\} catch \(error\) \{\s*if \(errorEl\) \{\s*errorEl\.innerText = error\.message;\s*errorEl\.classList\.remove\('hidden'\);\s*\}\s*\} finally \{/;
    
    const replacementRegex = `showTab('records');
                    loadAllData();
                } catch (error) {
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
    
    updated = text.replace(regex, replacementRegex);
    if (text !== updated) {
        fs.writeFileSync('index.html', updated);
        console.log("Fixed via regex!");
    } else {
        console.log("Regex also failed to match");
    }
} else {
    fs.writeFileSync('index.html', updated);
    console.log("Fixed via standard replace!");
}
