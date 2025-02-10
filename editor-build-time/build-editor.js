const spec = {
	filename: 'source-list.html',
	backend_url: 'verifyit-editor-source',
	table_cols: [
		{name: 'name', title: 'Source Name'},
		{name: 'description', title: 'Description'}
	],
	table_row_template: `<tr onclick="showForm('{{ row.source_id }}')"><td>{{ row.name }}</td><td>{{ row.description | safe }}</tr>`,
	dialog_id: 'source-form',
	target_id: 'source_id',
	fields: [
 		{name: 'name', title: 'Source Name', type: 'text'},
		{name: 'description', title: 'Description', type: 'text', trix: true}
	],
}

const main_template = () => `
<div hx-ext="client-side-templates">
	<table>
		<thead>
			<tr>
				${spec.table_cols.map( (col, idx) => `
						<th
								hx-get="https://cynphyadhk.g5.sqlite.cloud/v2/functions/${spec.backend_url}"
								hx-vals="js:{...dbParams({orderby: '${col.name}'})}"
								hx-trigger="click"
								hx-target="#rows"
								hx-swap="innerHTML"
								nunjucks-template="rows-template">
							${col.title}
						</th>
				`).join('\n')}
			</tr>
			<tr>
				${spec.table_cols.map( (col, idx) => `
				<th><input type="search" id="${col.name}" 
							hx-get="https://cynphyadhk.g5.sqlite.cloud/v2/functions/${spec.backend_url}"
							hx-vals="js:{...dbParams()}"
							hx-trigger="input changed delay:500ms, keyup[key=='Enter']${idx == 0 ? ', load' : ''}"
							hx-target="#rows"
							hx-swap="innerHTML"
							nunjucks-template="rows-template">
				</th>
				`).join('\n')}
			</tr>
		</thead>
		<tbody id="rows">
		</tbody>
	</table>
	<script type="text/template" id="rows-template">
		{% for row in data.result %}
			${spec.table_row_template}
		{% endfor %}
	</script>
</div>

<div>
	<dialog id="${spec.dialog_id}" hx-ext="client-side-templates">
		<article style="max-width:90%">
			<header>
				<button aria-label="Close" rel="prev" onclick="htmx.find('#${spec.dialog_id}').close()"></button>
				<p>
					<strong>Source</strong>
				</p>
			</header>
			<form
							hx-get="https://cynphyadhk.g5.sqlite.cloud/v2/functions/${spec.backend_url}"
							hx-vals="js:{${spec.target_id}: htmx.find('#${spec.dialog_id}').${spec.target_id}}"
							hx-trigger="intersect"
							hx-target="#fields"
							hx-swap="innerHTML"
							nunjucks-template="fields-template">
				<fieldset id="fields">
				</fieldset>
				<input
					type="submit"
					value="Save and Close"
				/>				
			</form>
			<footer>
				<button onclick="htmx.find('#${spec.dialog_id}').close()">Cancel</button>
				<button style="background-color: red" onclick="alert('Not implemented yet.')">Delete</button>
			</footer>
		</article>
		<script id="fields-template" type="text/template">
		${spec.fields.map( fld => `
			<label>
				${fld.title}
				<input
				type="${fld.type}"
				name="${fld.name}"
				value = "{{ data[0].${fld.name} }}"
				${fld.trix ? 'id="raw-"' + fld.name : ''}
				/>
				${fld.trix ? `<trix-editor input="raw-${fld.name}"></trix-editor>` : '' }
			</label>
		`).join('\n')}
		</script>
</dialog>
</div>
<script>

// function populateForm(id) {
// 	console.log('populateForm', id)
// }

function dbParams(others) {
	return {
	${spec.fields.map( fld => `${fld.name}: '%' + htmx.find('#${fld.name}').value + '%',`).join('\n')}
	...others
	}
}
function showForm(id) {
	console.log('showForm', id)
	const fm = htmx.find('#${spec.dialog_id}')
	fm.${spec.target_id} = id
	fm.show()
	console.log('check', htmx.find('#${spec.dialog_id}').${spec.target_id})
}
</script>
`

console.log(main_template())

// let word = 'world'
// let inner = `Hello ${word}`
// let outer = `${inner}, can you hear me now?`
// console.log(outer)
// let outer2 = `${`Hello ${word}`}, can you hear me now?`
// console.log(outer2)
