const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const searchString = `                        if (visibilityLogoutTimer) {
                            saveAuthUser(authUser); // Save to localStorage FIRST to prevent onAuthStateChanged race condition
                            
                            // Sign in anonymously to Firebase Auth so Firestore and Storage operations are authenticated`;
const replaceString = `                        if (visibilityLogoutTimer) {
                            clearTimeout(visibilityLogoutTimer);
                            visibilityLogoutTimer = null;
                        }
                    }
                });
            }
            function maybeFlushPendingHighlight() {
                if (!pendingHighlightId) return;
                const modal = document.getElementById('custom-modal');
                if (modal && !modal.classList.contains('hidden')) return;
                const id = pendingHighlightId;
                pendingHighlightId = null;
                highlightRecord(id);
            }
            async function submitLogin() {
                const userId = (document.getElementById('login-user-id').value || '').trim();
                const password = (document.getElementById('login-password').value || '').trim();
                const errorEl = document.getElementById('login-error');
                const btn = document.getElementById('login-submit-btn');
                if (errorEl) errorEl.classList.add('hidden');
                
                if (!userId) {
                    if (errorEl) {
                        errorEl.innerText = "Please enter your Email/User ID.";
                        errorEl.classList.remove('hidden');
                    }
                    return;
                }

                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin w-5 h-5 flex items-center justify-center"></i> Authenticating...';
                }
                
                try {
                    if (!password) {
                        throw new Error("Password is required for email login.");
                    }

                    // Await fetching the latest school config from Firebase to ensure correct credentials on new devices
                    if (window.db && window.firebaseAPI) {
                        try {
                            await fetchSystemConfigFromFirebase();
                        } catch (e) {
                            console.warn("Could not fetch school config from Firebase on login:", e);
                        }
                    }

                    let authUser = null;
                    
                    // Local level school login with hashed password
                    if (schoolConfig && schoolConfig.loginId && schoolConfig.loginId.toLowerCase() === userId.toLowerCase()) {
                        const savedPass = schoolConfig.loginEnc ? decryptLocal(schoolConfig.loginEnc) : schoolConfig.loginPassword;
                        if (savedPass && savedPass === password) {
                            authUser = { userId: schoolConfig.loginId, name: schoolConfig.name || 'School', role: 'school', email: schoolConfig.loginId };
                            saveAuthUser(authUser); // Save to localStorage FIRST to prevent onAuthStateChanged race condition
                            
                            // Sign in anonymously to Firebase Auth so Firestore and Storage operations are authenticated`;

content = content.replace(searchString, replaceString);
fs.writeFileSync('index.html', content);
console.log('Fixed successfully');
