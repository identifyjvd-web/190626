const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startMarker = '            function setupAutoLogoutTracking() {';
const endMarker = '            let forgotPasswordTimer = null;';

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const correctCode = `            function setupAutoLogoutTracking() {
                const events = ['click', 'keydown', 'input', 'mousemove', 'touchstart', 'scroll'];
                let lastResetTime = 0;
                events.forEach((eventName) => {
                    window.addEventListener(eventName, () => {
                        if (!currentUser) return;
                        const now = Date.now();
                        if (now - lastResetTime > 2000) {
                            lastResetTime = now;
                            resetAutoLogoutTimer();
                        }
                    }, { passive: true });
                });

                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') {
                        if (currentUser) {
                            visibilityLogoutTimer = setTimeout(() => {
                                logoutUser('Session expired because the app was closed/inactive for 3 minutes.');
                            }, 3 * 60 * 1000);
                        }
                    } else {
                        if (visibilityLogoutTimer) {
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
                            
                            // Sign in anonymously to Firebase Auth so Firestore and Storage operations are authenticated
                            if (window.auth && window.firebaseAPI && window.firebaseAPI.signInAnonymously) {
                                try {
                                    await window.firebaseAPI.signInAnonymously(window.auth);
                                } catch (e) {
                                    console.warn("Failed to sign in anonymously to Firebase:", e);
                                }
                            }
                        }
                    }

                    if (!authUser) {
                        // Fallback to Firebase for Admin/Others
                        const userCredential = await window.firebaseAPI.signInWithEmailAndPassword(window.auth, userId, password);
                        const user = userCredential.user;
                        
                        if (user.email && (user.email.toLowerCase() === 'admin' || user.email.toLowerCase() === 'identify.jvd@gmail.com')) {
                            authUser = { userId: 'admin', name: 'Admin', role: 'teacher', viewMode: 'all', email: user.email };
                        } else {
                            authUser = { userId: user.uid, name: (user.email ? user.email.split('@')[0] : 'School'), role: 'school', email: user.email };
                        }
                    }
                    
                    saveAuthUser(authUser);
                    resetAutoLogoutTimer();
                    showLoginOverlay(false);
                    showTab('records');
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
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Login';
                        lucide.createIcons();
                    }
                }
            }
            
`;

html = html.substring(0, startIndex) + correctCode + html.substring(endIndex);
fs.writeFileSync('index.html', html);
console.log('Fixed syntax error!');
