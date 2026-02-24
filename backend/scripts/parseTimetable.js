const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function parseHtml(filePath, outputPath) {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    const tables = $('table.odd_table, table.even_table');

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const TIME_SLOTS = [
        "08:30", "09:30", "10:30", "11:30", "12:30", "13:30",
        "14:30", "15:30", "16:30", "17:30", "18:30", "19:30",
        "20:30", "21:30"
    ];

    const result = {};

    tables.each((_, tableElement) => {
        const table = $(tableElement);
        const th = table.find('th[colspan="6"]');
        if (!th.length) return;

        let rawGroupName = th.text().trim();

        if (!(rawGroupName.startsWith("L5 SE") || rawGroupName.startsWith("L5 CS"))) {
            return;
        }

        let groupName = rawGroupName;
        const match = rawGroupName.match(/^L5 (SE|CS)\s*-?G(\d+)$/);
        if (match) {
            groupName = `${match[1]}-G${match[2]}`;
        }

        if (!result[groupName]) {
            result[groupName] = {};
            DAYS.forEach(day => {
                result[groupName][day] = {};
            });
        }

        const trs = table.find('tbody tr');
        const grid = Array.from({ length: 14 }, () => Array(6).fill(null));

        let rowIdx = 0;
        trs.each((_, trElement) => {
            const tr = $(trElement);
            const thTime = tr.find('th.yAxis');
            if (!thTime.length) return;

            const timeStr = thTime.text().trim();
            if (!TIME_SLOTS.includes(timeStr)) return;

            const rowActualIdx = TIME_SLOTS.indexOf(timeStr);
            let colIdx = 0;

            const tds = tr.find('td');
            tds.each((__, tdElement) => {
                const td = $(tdElement);
                while (colIdx < 6 && grid[rowActualIdx][colIdx] !== null) {
                    colIdx++;
                }
                if (colIdx >= 6) return false; // break

                const rowspan = parseInt(td.attr('rowspan') || '1', 10);
                let contentHtml = td.html() || '';

                // Decode HTML entities roughly
                contentHtml = contentHtml.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

                let content = contentHtml.split(/<br\s*\/?>/i);
                content = content.map(c => c.replace(/<[^>]+>/g, '').trim()).filter(c => c);

                let cellData = { module: "Free", room: "", type: "", lecturer: "" };

                if (content.length > 0 && content[0] !== '---') {
                    let code = "Unknown";
                    let typeStr = "";
                    let room = "TBA";
                    let lecturer = "Unknown Lecturer";

                    let fullModuleLine = content[0];
                    let codeMatch = null;
                    
                    // 1. Find Code (e.g., 5COSC021C)
                    for (let line of content) {
                        const match = line.match(/\b([1-9][A-Z]{3,4}\d{3}[A-Z]?)\b/);
                        if (match && code === "Unknown") {
                            codeMatch = match;
                            code = match[1];
                            fullModuleLine = line;
                        }
                    }
                    if (code === "Unknown" && content.length > 0) {
                        // Fallback: If no code found, just take first line but strip type keywords
                        code = fullModuleLine.replace(/\b(LEC|TUT|PRA)\b/gi, '').trim() || "Unknown";
                    }

                    // 2. Find Type (LEC/TUT/PRA)
                    for (let line of content) {
                        const match = line.toUpperCase().match(/\b(LEC|TUT|PRA)\b/);
                        if (match) {
                            typeStr = match[1];
                            break;
                        }
                    }

                    // 3. Find Room
                    for (let line of content) {
                        const upper = line.toUpperCase();
                        if (upper.includes("ONLINE") || upper.includes("EXAM HALL") || upper.includes("SP-") || upper.includes("SP -") || /\bSP\b/.test(upper)) {
                            room = line.trim();
                            break;
                        }
                    }

                    // 4. Find Lecturer(s)
                    const reservedWordsRegex = /^(LEC|TUT|PRA|FREE|---)$/i;
                    let lecturerLines = content.filter(line => {
                        const upper = line.toUpperCase();
                        // Module names usually have lowercase letters, while lecturer initials are all caps.
                        // Filter out mixed-case lines to avoid treating module names as lecturers.
                        if (line !== upper) return false;
                        
                        // Avoid matching the module code line
                        if (upper.includes(code.toUpperCase())) return false;
                        if (codeMatch && upper.includes(codeMatch[0].toUpperCase())) return false;
                        
                        // Avoid matching room or reserved keywords
                        if (upper === room.toUpperCase()) return false;
                        if (reservedWordsRegex.test(upper)) return false;
                        if (upper.includes("ONLINE") || upper.includes("EXAM HALL") || upper.includes("SP-") || upper.includes("SP -") || /\bSP\b/.test(upper)) return false;
                        if (upper.includes("MODULE NAME")) return false;
                        
                        return true;
                    });

                    if (lecturerLines.length > 0) {
                        lecturer = lecturerLines.join(", ").trim();
                    } else if (content.length > 1) {
                        // Fallback if no ALL-CAPS lecturers found (very rare)
                        const fallbackLine = content[1].trim();
                        if (fallbackLine !== fullModuleLine.trim() && fallbackLine.toUpperCase() !== room.toUpperCase()) {
                            lecturer = fallbackLine;
                        }
                    }

                    cellData = {
                        module: code,
                        room: room,
                        type: typeStr,
                        lecturer: lecturer
                    };

                    for (let r = 0; r < rowspan; r++) {
                        if (rowActualIdx + r < 14) {
                            grid[rowActualIdx + r][colIdx] = cellData;
                        }
                    }
                } else {
                    for (let r = 0; r < rowspan; r++) {
                        if (rowActualIdx + r < 14) {
                            grid[rowActualIdx + r][colIdx] = "Free";
                        }
                    }
                }

                colIdx++;
            });
            rowIdx++;
        });

        DAYS.forEach((dayName, dayIdx) => {
            TIME_SLOTS.forEach((timeVal, tIdx) => {
                let cellVal = grid[tIdx][dayIdx];
                if (cellVal === null) cellVal = "Free";
                result[groupName][dayName][timeVal] = cellVal;
            });
        });
    });

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 4), 'utf-8');
    console.log(`Extraction complete. Found ${Object.keys(result).length} groups.`);

    // Cleanup HTML
    try {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted ${filePath}`);
    } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
    }
}

const inputHtml = path.join(__dirname, '..', 'DOM_L5_SE_CS_1.html'); // wait, the file is '../L5 SE CS - 1.html'
const inputFile = path.join(__dirname, '..', 'L5 SE CS - 1.html');
const outputFile = path.join(__dirname, '..', 'data', 'timetable.json');

parseHtml(inputFile, outputFile);
