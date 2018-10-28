const fileHost = '/file'

var path = '/'
var items = []
var order = [0, 1]

function sortBy(attribute,reverse){
	reverse = (reverse) ? 1 : -1
	return function(front,back){
		front = front[attribute]
		back = back[attribute]
		if(front < back)
			return 1 * reverse
		else if(front > back)
			return -1 * reverse
		else
			return 0
	}
}

function timeFormat(time){
	if(time == null) return '-'
	var date = time.toDateString().split(' ').slice(1,3).join(' ')
	if(time.getFullYear() == (new Date).getFullYear())
		return `${date} ${time.toTimeString().slice(0,5)}`
	else
		return `${date} ${time.getFullYear()}`
}

function sizeFormat(size){
	if(size == null) return '-'
	unit = 0
	while(true){
		if(size < 1024) break
		size = size / 1024
		unit += 1
	}
	sizeFixed = size.toFixed(2)
	size = (sizeFixed == size) ? size : sizeFixed
	return size + ['B', 'KB', 'MB', 'GB', 'TB'][unit]
}

function pathJoin(){
	var paths = Array.from(arguments)
	paths = paths.map(function(fragment){return fragment.split('/')})
	paths = paths.reduce(function(previous, current){return previous.concat(current)})
	paths = paths.map(function(fragment){return fragment.trim()})
	paths = paths.filter(function(fragment){return fragment != '.' && fragment != ''})
	while(true){
		var index = paths.indexOf('..')
		if(index == -1) break
		else if(index > 0) paths.splice(index - 1, 2)
		else throw new Error('permission denied')
	}
	return '/' + paths.join('/')
}

function createElement(tagName, className, innerHTML){
	var element = document.createElement(tagName)
	if(className) element.className = className 
	if(innerHTML) element.innerHTML = innerHTML 
	return element
}

function buildTitle(){
	var titleElement = createElement('div', 'title')
	var elements = [
		createElement('span', 'name', 'File Name'),
		createElement('span', 'size', 'File Size'),
		createElement('span', 'date', 'Date')
	]
	elements.forEach(function(element, index){
		if(index == order[0])
			element.classList.add(order[1] ? 'asc': 'desc')
		element.onclick = function(){
			if(index == order[0]){
				order[1] = !order[1]
			}
			else{
				order[0] = index
				order[1] = 1
			}
			show()
		}
		titleElement.appendChild(element)
	})
	return titleElement
}

function buildItem(item){
	var fileElement = createElement('a', 'item')
	if(item.type == 'file'){
		fileElement.href = fileHost + pathJoin(path, item.name)
		fileElement.download = item.name
		fileElement.target = '_blank'
	}
	else{
		fileElement.classList.add('directory')
		fileElement.href = '#' + pathJoin(path, item.name)
	}
	[
		createElement('span', 'name', (item.name == '..') ? 'Parent directory' : item.name),
		createElement('span', 'size', sizeFormat(item.size)),
		createElement('span', 'date', timeFormat(item.mtime))
	].forEach(function(element){
		fileElement.appendChild(element)
	})
	return fileElement
}

function sort(){
	var files = items.filter(function(item){return item.type != "directory"})
	var directories = items.filter(function(item){return item.type == "directory"})
	var attribute = ['name','size','mtime'][order[0]]
	files = files.sort(sortBy(attribute, !order[1]))
	directories = directories.sort(sortBy(attribute, !order[1]))
	items = order[1] ? directories.concat(files) : files.concat(directories)
}

function show(){
	sort()
	var headerElement = createElement('div', 'header')
	headerElement.appendChild(createElement('div', 'path', (path == '/' ? 'Home' : path)))
	headerElement.appendChild(buildTitle())
	var listElement = createElement('div', 'list')
	items.forEach(function(item){listElement.appendChild(buildItem(item))})
	var footerElement = createElement('div', 'footer')
	document.body.innerHTML = ""
	Array.from([headerElement, listElement, footerElement])
	.forEach(function(element){document.body.appendChild(element)})
}

function load(){
	path = decodeURIComponent((window.location.hash || '#/').slice(1))
	return fetch(fileHost + path + '/', {credentials: 'include'})
	.then(function(response){return response.json()})
	.then(function(data){
		data.forEach(function(line){line.mtime = new Date(line.mtime)})
		if(path != '/') data.unshift({name: "..", type: "directory"})
		items = data
	})
	.then(show)
	.catch(function(error){
		document.body.innerHTML = ''
		document.body.appendChild(createElement('div', 'error'))
	})
}


window.onload = load
window.onpopstate = load
