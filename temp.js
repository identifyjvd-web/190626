
    let ie_importParsedData = [];
    let ie_importHeaders = [];

    function openImportExportModal() {
        document.getElementById('import-export-modal').classList.remove('hidden');
        document.getElementById('import-export-modal').classList.add('flex');
        ie_renderExportFields();
    }
    
    function closeImportExportModal() {
        document.getElementById('import-export-modal').classList.add('hidden');
        document.getElementById('import-export-modal').classList.remove('flex');
    }
    
    function ie_switchTab(tab) {
        if(tab === 'export') {
            document.getElementById('ie-tab-export').className = 'flex-1 py-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600 transition';
            document.getElementById('ie-tab-import').className = 'flex-1 py-4 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-700 transition';
            document.getElementById('ie-content-export').classList.remove('hidden');
            document.getElementById('ie-content-export').classList.add('block');
            document.getElementById('ie-content-import').classList.add('hidden');
            document.getElementById('ie-content-import').classList.remove('block');
        } else {
            document.getElementById('ie-tab-import').className = 'flex-1 py-4 text-sm font-bold text-emerald-600 border-b-2 border-emerald-600 transition';
            document.getElementById('ie-tab-export').className = 'flex-1 py-4 text-sm font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-700 transition';
            document.getElementById('ie-content-import').classList.remove('hidden');
            document.getElementById('ie-content-import').classList.add('block');
            document.getElementById('ie-content-export').classList.add('hidden');
            document.getElementById('ie-content-export').classList.remove('block');
        }
    }
    
    function ie_renderExportFields() {
        const grid = document.getElementById('ie-export-fields-grid');
        const qrGrid = document.getElementById('ie-export-qr-fields-grid');
        let html = '';
        let qrHtml = `<label class="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-blue-50"><input type="checkbox" value="id" class="ie-qr-cb accent-blue-600 w-3.5 h-3.5" checked><span class="text-[10px] font-bold text-slate-700 truncate">System ID</span></label>`;
        
        fb_form_order.forEach(id => {
            let f = null;
            let label = '';
            if (FB_STANDARD_FIELDS.some(sf => sf.id === id)) {
                const stdField = FB_STANDARD_FIELDS.find(sf => sf.id === id);
                if (!fb_standard_config[id] || fb_standard_config[id].enabled) {
                    f = stdField;
                    label = fb_getStandardLabel(id, stdField.label);
                }
            } else {
                f = fb_fields.find(cf => cf.id === id);
                if (f) label = f.label;
            }
            if (f && f.type !== 'section' && f.type !== 'image' && f.id !== 'photo') {
                html += `<label class="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" value="${f.id}" class="ie-export-cb accent-blue-600 w-4 h-4" checked><span class="text-xs font-bold text-slate-700 truncate">${label}</span></label>`;
                qrHtml += `<label class="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-blue-50"><input type="checkbox" value="${f.id}" class="ie-qr-cb accent-blue-600 w-3.5 h-3.5"><span class="text-[10px] font-bold text-slate-700 truncate">${label}</span></label>`;
            }
        });
        grid.innerHTML = html;
        qrGrid.innerHTML = qrHtml;
    }
    
    function ie_toggleExportQrFields() {
        const qrOpts = document.getElementById('ie-export-qr-options');
        if (document.getElementById('ie-export-qr').checked) {
            qrOpts.classList.remove('hidden');
        } else {
            qrOpts.classList.add('hidden');
        }
    }
    
    async function ie_runExport() {
        const btn = document.getElementById('ie-btn-export');
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';
        btn.disabled = true;
        
        try {
            const selectedFields = Array.from(document.querySelectorAll('.ie-export-cb:checked')).map(cb => cb.value);
            const includePhotos = document.getElementById('ie-export-photos').checked;
            const includeQr = document.getElementById('ie-export-qr').checked;
            const qrFields = Array.from(document.querySelectorAll('.ie-qr-cb:checked')).map(cb => cb.value);
            
            const zip = new JSZip();
            const exportData = [];
            const photoFolder = includePhotos ? zip.folder("Photos") : null;
            const qrFolder = includeQr ? zip.folder("QR_Codes") : null;
            
            for (let i = 0; i < db.length; i++) {
                const rec = db[i];
                let row = { 'System ID': rec.id };
                
                selectedFields.forEach(id => {
                    let label = id;
                    if (FB_STANDARD_FIELDS.some(sf => sf.id === id)) {
                        label = fb_getStandardLabel(id, FB_STANDARD_FIELDS.find(sf => sf.id === id).label);
                    } else {
                        const f = fb_fields.find(cf => cf.id === id);
                        if (f) label = f.label;
                    }
                    row[label] = rec[id] || '';
                });
                exportData.push(row);
                
                const safeName = ((rec.studentName || rec.name || rec.title || 'Unknown') + '').replace(/[^a-zA-Z0-9]/g, '_');
                const baseFileName = `${safeName}_${rec.id.substring(rec.id.length - 4)}`;
                
                if (includePhotos) {
                    const photoBase64 = rec.docUrl || rec.photoData;
                    if (photoBase64 && photoBase64.startsWith('data:image')) {
                        const base64Data = photoBase64.split(',')[1];
                        photoFolder.file(`Photo_${baseFileName}.jpg`, base64Data, {base64: true});
                    }
                }
                
                if (includeQr) {
                    let qrVal = "";
                    if (qrFields.length === 1 && qrFields[0] === 'id') {
                        qrVal = String(rec.id);
                    } else {
                        const obj = {};
                        qrFields.forEach(f => { obj[f] = rec[f] || ""; });
                        qrVal = JSON.stringify(obj);
                    }
                    try {
                        const qr = new QRious({ value: qrVal, size: 300, level: 'H' });
                        const qrBase64 = qr.toDataURL().split(',')[1];
                        qrFolder.file(`QR_${baseFileName}.png`, qrBase64, {base64: true});
                    } catch(e) {}
                }
            }
            
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Exported_Data");
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            zip.file("Data_Export.xlsx", excelBuffer);
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Zipping...';
            const content = await zip.generateAsync({type:"blob"});
            saveAs(content, `System_Export_${new Date().toISOString().split('T')[0]}.zip`);
            
            showToast("Export Completed Successfully");
        } catch(err) {
            console.error(err);
            showToast("Error during export: " + err.message, true);
        } finally {
            btn.innerHTML = origHTML;
            btn.disabled = false;
        }
    }
    
    function ie_handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        document.getElementById('ie-import-filename').textContent = file.name;
        document.getElementById('ie-import-filename').classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            ie_importParsedData = XLSX.utils.sheet_to_json(firstSheet, {defval: ""});
            
            if (ie_importParsedData.length > 0) {
                ie_importHeaders = Object.keys(ie_importParsedData[0]);
                let html = '';
                ie_importHeaders.forEach(h => {
                    html += `<label class="flex items-center gap-2 p-3 bg-white rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-50"><input type="checkbox" value="${h}" class="ie-import-cb accent-emerald-600 w-4 h-4" checked><span class="text-xs font-bold text-slate-700 truncate">${h}</span></label>`;
                });
                document.getElementById('ie-import-columns-grid').innerHTML = html;
                document.getElementById('ie-import-mapping-container').classList.remove('hidden');
                document.getElementById('ie-btn-import').classList.remove('hidden');
            } else {
                showToast("The selected Excel file is empty.", true);
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    async function ie_runImport() {
        const btn = document.getElementById('ie-btn-import');
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';
        btn.disabled = true;
        
        try {
            const selectedCols = Array.from(document.querySelectorAll('.ie-import-cb:checked')).map(cb => cb.value);
            if (selectedCols.length === 0) throw new Error("No columns selected for import.");
            
            const mapping = {};
            selectedCols.forEach(col => {
                const colLower = col.toLowerCase().trim();
                let matchedId = null;
                
                FB_STANDARD_FIELDS.forEach(sf => {
                    if (sf.label.toLowerCase() === colLower || sf.id.toLowerCase() === colLower) matchedId = sf.id;
                });
                
                if (!matchedId) {
                    fb_fields.forEach(cf => {
                        if (cf.label.toLowerCase() === colLower || cf.id.toLowerCase() === colLower) matchedId = cf.id;
                    });
                }
                
                mapping[col] = matchedId || col.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            });
            
            let importCount = 0;
            const schoolId = currentUser ? currentUser.userId : 'anonymous';
            const { collection, addDoc } = window.firebaseAPI || {};
            if (!collection || !addDoc) throw new Error('Firebase functions not initialized properly.');
            
            for (let i = 0; i < ie_importParsedData.length; i++) {
                const row = ie_importParsedData[i];
                const record = {
                    createdAt: Date.now(),
                    schoolId: schoolId,
                    deviceId: localStorage.getItem('device_id') || 'web-import',
                    syncStatus: 'synced',
                    status: 'pending'
                };
                
                let hasPhoto = false;
                
                selectedCols.forEach(col => {
                    const val = row[col];
                    const sysId = mapping[col];
                    record[sysId] = val;
                    
                    if (sysId === 'photoData' || sysId === 'docUrl' || col.toLowerCase() === 'photo' || col.toLowerCase() === 'image') {
                        if (val && val.length > 5) {
                            record.docUrl = val;
                            hasPhoto = true;
                        }
                    }
                });
                
                if (hasPhoto) {
                    record.status = 'unverified';
                    record.verified = false; 
                } else {
                    record.status = 'pending';
                }
                
                await addDoc(collection(window.firestore, "students"), record);
                importCount++;
            }
            
            showToast(`Successfully imported ${importCount} records.`);
            closeImportExportModal();
            
            if (typeof loadAllData === 'function') {
                loadAllData();
            }
        } catch(err) {
            console.error(err);
            showToast("Error during import: " + err.message, true);
        } finally {
            btn.innerHTML = origHTML;
            btn.disabled = false;
        }
    }
    