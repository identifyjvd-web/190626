const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');

const target = `                    let authUser = null;
                    
                    // Local level school login with hashed password
                    if (schoolConfig && schoolConfig.loginId && schoolConfig.loginId.toLowerCase() === userId.toLowerCase()) {`;

const replacement = `                    let authUser = null;
                    
                    const isAdminId = (userId.toLowerCase() === 'admin' || userId.toLowerCase() === 'identify.jvd@gmail.com');
                    
                    // If Admin, skip local school login entirely so they don't get trapped as a school if schoolConfig matches
                    if (!isAdminId && schoolConfig && schoolConfig.loginId && schoolConfig.loginId.toLowerCase() === userId.toLowerCase()) {`;

text = text.replace(target, replacement);

const target2 = `                    if (!authUser) {
                        // Fallback to Firebase for Admin/Others
                        const userCredential = await window.firebaseAPI.signInWithEmailAndPassword(window.auth, userId, password);`;

// If they type 'admin', they can't use Firebase Email login directly unless we map it to the email.
const replacement2 = `                    if (!authUser) {
                        // Fallback to Firebase for Admin/Others
                        let firebaseLoginId = userId;
                        if (userId.toLowerCase() === 'admin') {
                            firebaseLoginId = 'identify.jvd@gmail.com'; // Map 'admin' to the actual admin email for Firebase auth
                        }
                        const userCredential = await window.firebaseAPI.signInWithEmailAndPassword(window.auth, firebaseLoginId, password);`;

text = text.replace(target2, replacement2);

fs.writeFileSync('index.html', text);
console.log('Admin login priority fixed!');
