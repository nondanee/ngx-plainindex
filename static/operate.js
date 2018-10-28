const uploadHost = '/upload'
const indicator = createElement('div','indicator')

function notify(text, progress){
	indicator.innerHTML = ''
	let textElement = indicator.appendChild(createElement('div','text',text))
	let progressElement = textElement.appendChild(createElement('div','progress'))
	if(progress){
		progress = (progress * 100).toFixed() + '%'
		progressElement.style.width = progress
		textElement.innerHTML += ` (${progress})`
	}
	if(!indicator.parentNode) document.body.appendChild(indicator)
}
function disappear(){
	if(indicator.parentNode) indicator.parentNode.removeChild(indicator)
}

document.addEventListener('dragenter', function(event){  
	event.preventDefault()
	notify('Drop to upload')
}, false)
document.addEventListener('dragleave', function(event){ 
	event.preventDefault()
	disappear()
}, false)
document.addEventListener('dragover', function(event){
  	event.preventDefault()
}, false)

document.addEventListener('drop', function(event){  
	event.preventDefault()
	upload(event.dataTransfer.files[0])
}, false)


function upload(file){
	let xhr = new XMLHttpRequest()
	let formData = new FormData()
	formData.append("file", file)
	
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				notify('Done!')
			}
			else if(xhr.status == 403){
				notify('Permission denied!')
			}
			setTimeout(function(){
				load()
				disappear()
			}, 2000)
		}
	}
	xhr.upload.onprogress = function(event){
		if(event.lengthComputable){ 
			notify('Uploading...', event.loaded / event.total)
		}
	}
	xhr.open('POST', uploadHost)
	xhr.setRequestHeader('directory', path)
	xhr.send(formData)
}