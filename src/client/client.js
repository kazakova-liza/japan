let dataForTable = [];
let dates = [];

const render = (state) => {
    const elements = Object.keys(state);
    elements.map((el) => {
        if (state[el].class === 'button') {
            state[el].id.disabled = state[el].disabled;
        }
    })
}

let state;
const startButton = document.getElementById('start');
const periodButton = document.getElementById('period++');
const phaseButton = document.getElementById('phase++');
const jumpButton = document.getElementById('jump');
const dumpButton = document.getElementById('dump');
const executeButton = document.getElementById('execute');
const svgElement = document.getElementById('svg1');
const tableElement = document.getElementById('table');
const svgDoc = svgElement.contentDocument;

const disabledState = state = {
    startButton: {
        id: startButton,
        class: 'button',
        disabled: true
    },
    periodButton: {
        id: periodButton,
        class: 'button',
        disabled: true
    },
    phaseButton: {
        id: phaseButton,
        class: 'button',
        disabled: true
    },
    jumpButton: {
        id: jumpButton,
        class: 'button',
        disabled: true
    },
    dumpButton: {
        id: dumpButton,
        class: 'button',
        disabled: true
    },
    executeButton: {
        id: executeButton,
        class: 'button',
        disabled: true
    }
};

const enabledState = state = {
    startButton: {
        id: startButton,
        class: 'button',
        disabled: false
    },
    periodButton: {
        id: periodButton,
        class: 'button',
        disabled: false
    },
    phaseButton: {
        id: phaseButton,
        class: 'button',
        disabled: false
    },
    jumpButton: {
        id: jumpButton,
        class: 'button',
        disabled: false
    },
    dumpButton: {
        id: dumpButton,
        class: 'button',
        disabled: false
    },
    executeButton: {
        id: executeButton,
        class: 'button',
        disabled: false
    }
};

const json2Table = (json) => {
    //https://dev.to/boxofcereal/how-to-generate-a-table-from-json-data-with-es6-methods-2eel
    let cols = Object.keys(json[0]);
    let headerRow = cols
        .map(col => `<th>${col}</th>`)
        .join("");

    let rows = json
        .map(row => {
            let tds = cols.map(col => `<td>${row[col]}</td>`).join("  ");
            return `<tr>${tds}</tr>`;
        })
        .join("  ");

    const table = `
    <table>
      <thead>
        <tr>${headerRow}</tr>
      <thead>
      <tbody>
        ${rows}
      <tbody>
    <table>`;

    return table;
}

const ws = new WebSocket('ws://localhost:50006/');
ws.onopen = () => {
    console.log('WebSocket Client Connected');
    const command = {
        topic: 'inputs',
    };
    ws.send(JSON.stringify(command));
};

ws.onmessage = (e) => {
    const message = JSON.parse(e.data);
    if (message.topic === 'inputs') {
        let html = '';
        for (const input of message.payload) {
            html += `<label for="${input.name}"> ${input.name}: </label>
                <textarea id="${input.name}" name="${input.name}" rows="1" cols="20"> </textarea>
                <br>`;
        }
        const inputs = document.getElementById('inputs');
        inputs.innerHTML = html;
    }

    if (message.topic == 'disableButtons') {
        render(disabledState);
    }

    if (message.topic == 'enableButtons') {
        render(enabledState);
    }

    if (message.topic == 'variablesUpdate') {
        console.log(message);
        for (const element of message.payload) {
            svgDoc.getElementById(element.id).textContent = element.value;
            const currentDate = document.getElementById('period').textContent;
            if (dataForTable.length === 0) {
                dataForTable.push({
                    name: element.id,
                    [currentDate]: element.value
                })
            }
            for (let i = 0; i < dataForTable.length; i++) {
                if (dataForTable[i].name === element.id) {
                    if (!dataForTable[i].hasOwnProperty(currentDate)) {
                        dataForTable[i][currentDate] = element.value;
                    }
                    break;
                }
                if (i === dataForTable.length - 1 && dataForTable[i].name !== element.id) {
                    dataForTable.push({
                        name: element.id,
                        [currentDate]: element.value
                    })
                }
            }
            tableElement.innerHTML = json2Table(dataForTable);
        }
    }

    if (message.topic == 'setToDashes') {
        console.log(message);
        const variables = svgDoc.getElementsByClassName('variables');
        for (const element of variables) {
            element.textContent = '-';
        }
        console.log(`data for table: ${dataForTable}`);
        tableElement.innerHTML = json2Table(dataForTable);
    }

    if (message.topic == 'htmlUpdate') {
        console.log(message);
        for (const element of message.payload) {
            document.getElementById(element.id).textContent = element.value;
        }
    }

    if (message.topic === 'svgUpdate') {
        console.log(message);
        const elementToUpdate = svgDoc.getElementById(message.payload.id);
        elementToUpdate.style.fill = message.payload.color;
    }
};


startButton.addEventListener('click', (e) => {
    e.preventDefault();
    const command = {
        topic: 'start',
    };
    ws.send(JSON.stringify(command));
    render(disabledState);
});

periodButton.addEventListener('click', (e) => {
    e.preventDefault();
    const command = {
        topic: 'period++',
    };
    ws.send(JSON.stringify(command));
    render(disabledState);
});

phaseButton.addEventListener('click', (e) => {
    e.preventDefault();
    const command = {
        topic: 'phase++',
    };
    ws.send(JSON.stringify(command));
    render(disabledState);
});

jumpButton.addEventListener('click', (e) => {
    e.preventDefault();
    const numberOfPeriods = document.getElementById('numberOfPeriods').value;
    const command = {
        topic: 'jump',
        payload: numberOfPeriods
    };
    ws.send(JSON.stringify(command));
    render(disabledState);
});

dumpButton.addEventListener('click', (e) => {
    e.preventDefault();
    const tableName = document.getElementById('mySQLTable').value
    const command = {
        topic: 'dump',
        payload: tableName
    };
    ws.send(JSON.stringify(command));
    render(disabledState);
});

executeButton.addEventListener('click', (e) => {
    e.preventDefault();
    const command = {
        topic: 'execute period',
    };
    ws.send(JSON.stringify(command));
    render(disabledState);
});

const draw = SVG('#svg1');

svgElement.addEventListener('load', function () {
    const panZoom = svgPanZoom(svgElement, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        minZoom: 0.1,
        mouseWheelZoomEnabled: false,
        // fit: 1,
        center: false
    });
    panZoom.zoom(1);
    panZoom.fit();
    panZoom.resize();
});





