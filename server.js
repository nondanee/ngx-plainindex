const fs = require('fs')
const path = require('path')
const http = require('http')

const stat = (directory, name) => {
	const root = '/server/file'
	try{
		let dirStat = fs.statSync(path.join(root, directory))
		if(!dirStat.isDirectory()) return false
	}
	catch(e){
		fs.mkdirSync(path.join(root, directory))
	}
	if(name == null) return path.join(root, directory)
	name = path.parse(name)
	let origin = [name.name, name.ext]
	name = name.base
	let index = 0
	while(fs.existsSync(path.join(root, directory, name))){
		index += 1
		name = origin.join(`(${index})`)
	}
	return path.join(root, directory, name)
}

const authorization = (request) => {
	let token = Buffer.from((request.headers['authorization'] || 'Basic ').slice(6), 'base64').toString('ascii').split(':')
	if(!token[0]) return false
	else return token[0]
}

const receiver = (request) => {
	return new Promise((resolve, reject) => {
		let user = authorization(request)
		if(!user) return reject(401)
		let directory = decodeURIComponent(request.headers['directory'] || '')
		if(!directory) return reject(400)
		directory = directory.slice(1) + '/'
		if(!directory.startsWith(user + '/')) return reject(403)
		if(!stat(directory)) return reject(404)

		let boundary = request.headers['content-type'].split(/boundary=/).pop()
		let file = {name: '',stream: false}
		request.on('data', data => {
			let pointer = {head: 0, tail: 0, data: -1}
			while(pointer.head + boundary.length + 6 < data.length){
				pointer.head = data.indexOf(`--${boundary}\r\n`, pointer.head)
				pointer.head = file.stream ? -1: pointer.head
				pointer.head = pointer.head == -1 ? 0 : pointer.head + 2 + boundary.length + 2
				pointer.tail = data.indexOf(`\r\n--${boundary}`, pointer.head)
				pointer.tail = pointer.tail == -1 ? data.length : pointer.tail
				pointer.data = data.indexOf('\r\n\r\n', pointer.head) + 4

				let name = pointer.data == -1 ? '' : data.slice(pointer.head, pointer.data).toString().split('\r\n').shift()
				name = name.includes('filename=') ? name.split('filename=').pop().slice(1, -1) : ''

				if(name) file.name = name
				if(file.name && !file.stream){file.stream = fs.createWriteStream(stat(directory, name))}
				if(file.stream) file.stream.write(data.slice(pointer.head == 0 ? 0 : pointer.data, pointer.tail))
				if(file.stream && pointer.tail != data.length) {file.stream.end(), file.stream = false}
				pointer.head = pointer.tail + 2
			}
		})
		request.on('error', error => {
			if(file.stream) file.stream.end()
			return reject(406)
		})
		request.on('end', error => {
			return resolve()
		})
	})
}

http.createServer((request, response) => {
	if(request.url == '/' && request.method == 'POST' && request.headers['content-type'].startsWith('multipart/form-data;')){
		receiver(request)
		.then(() => {
			response.writeHead(200)
			response.end()
		})
		.catch((error) => {
			response.writeHead(error)
			response.end()
		})
	}
	else if(request.url == '/' && request.method == 'OPTIONS'){
		response.writeHead(200)
		response.end()
	}
	else{
		response.writeHead(400)
		response.end()
	}
}).listen(5000, '127.0.0.1')