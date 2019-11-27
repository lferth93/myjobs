var blessed = require('blessed')
    , contrib = require('blessed-contrib')
    , table = require('./tabla.js')
    , line = require('./cpuline.js')
    , rline = require('./ramline.js')
    , itable = require('./inftable.js')
    , meow = require('meow')



setup().catch(console.log)

async function setup() {
    const cli = meow(`
	Usage
	  $ myjobs <>

	Options
	  --group, -g  Mostrar los jobs del grupo (solo para investigadores)

	Examples
	  $ myjobs -g usuario
`, {
        flags: {
            group: {
                type: 'boolean',
                default: false,
                alias: 'g'
            }
        }
    });
    var screen = blessed.screen()
    var grid = new contrib.grid({ rows: 7, cols: 5, screen: screen })

    var jobsTable = grid.set(0, 0, 7, 2, contrib.table, {
        keys: true
        , vi: true
        , fg: 'white'
        , selectedFg: 'white'
        , selectedBg: 'blue'
        , interactive: true
        , label: cli.input[0] + ' MyJobs'
        , width: '100%'
        , height: '100%'
        , border: { type: "line", fg: "cyan" }
        , columnSpacing: 5 //in chars
        , columnWidth: [8, 15, 20] /*in chars*/
    });

    var infoTable = grid.set(0, 2, 1, 3, contrib.table, {
        fg: 'white'
        , selectedFg: 'white'
        , selectedBg: 'blue'
        , interactive: true
        , label: 'Info'
        , width: '100%'
        , height: '100%'
        , border: { type: "line", fg: "cyan" }
        , columnSpacing: 5 //in chars
        , columnWidth: [8, 10, 10, 5, 10, 8, 8] /*in chars*/
    })

    var cpuLine = grid.set(1, 2, 3, 3, contrib.line, {
        style:
        {
            line: "yellow"
            , text: "green"
            , baseline: "green"
        }
        , height: '100%'
        , showLegend: true
        , xLabelPadding: 3
        , xPadding: 5
        , showLegend: true
        , wholeNumbersOnly: false
        , label: 'CPU%'
    });

    var ramLine = grid.set(4, 2, 3, 3, contrib.line, {
        style:
        {
            line: "yellow"
            , text: "green"
            , baseline: "green"
        }
        , height: '100%'
        , showLegend: true
        , xLabelPadding: 3
        , xPadding: 5
        , showLegend: true
        , wholeNumbersOnly: false
        , label: 'Ram%'
    });


    await jobsTable.rows.on('select', async function (item, index) {
        if (index > 0) {
            await line.setData(cpuLine, table.data[index - 1])
            await rline.setData(ramLine, table.data[index - 1])
            await itable.setData(infoTable, table.data[index - 1])
            screen.render()
        }
    });


    await table.setup(jobsTable, cli.input[0], cli.flags.group);

    screen.key(['escape', 'q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });
    screen.on('resize', function () {
        ramLine.emit('attach');
        cpuLine.emit('attach')
    });
    jobsTable.focus()
    screen.render()
}