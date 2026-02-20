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

        const groupName = th.text().trim();

        if (!(groupName.startsWith("L5 SE") || groupName.startsWith("L5 CS"))) {
            return;
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
                    const line1 = content.length > 1 ? content[1] : content[0];

                    let typeStr = "";
                    const upperLine1 = line1.toUpperCase();
                    if (upperLine1.includes("LEC")) typeStr = "LEC";
                    else if (upperLine1.includes("TUT")) typeStr = "TUT";
                    else if (upperLine1.includes("PRA")) typeStr = "PRA";
                    else if (upperLine1.split(/\s+/).includes("M")) typeStr = "Module";

                    let room = "";
                    if (upperLine1.includes("ONLINE")) {
                        room = "ONLINE";
                    } else if (content.length > 3) {
                        room = content[3];
                    } else if (content.length > 2 && content[2].includes("SP")) {
                        room = content[2];
                    } else {
                        room = "TBA";
                    }

                    let lecturer = "Unknown Lecturer";
                    if (content.length > 2 && !content[2].includes("SP")) {
                        lecturer = content[2];
                    } else if (content.length > 1 && !content[1].includes("SP")) {
                        lecturer = content[1];
                    }

                    let moduleName = line1;
                    const match = line1.match(/^([A-Z0-9]+)\s*(.*)/);
                    if (match) {
                        const code = match[1];
                        const labels = {
                            "5COSC021C": "Software Engineering",
                            "5COSC999C": "System Design",
                            "5SENG003C": "Professional Practice",
                            "5DATA001C": "Database Systems",
                            "5COSC024C": "Algorithms",
                            "5COSC022C": "Programming II",
                            "5COSC023C": "Computer Networks",
                            "5CCGD013C": "Graphics",
                            "5CCGD010C": "Game Dev",
                            "5COSC019C": "Object Oriented Programming",
                            "5COSC020C": "Client Server Architecture",
                        };
                        if (labels[code]) {
                            moduleName = `${code} ${labels[code]} ${typeStr}`.trim();
                        }
                    }

                    cellData = {
                        module: moduleName,
                        room: room.trim(),
                        type: typeStr,
                        lecturer: lecturer.trim()
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
