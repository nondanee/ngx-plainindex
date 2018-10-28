const uploadHost = '/upload'
const indicator = createElement('div','indicator')

function notify(text, progress){
	indicator.innerHTML = ''
	var textElement = indicator.appendChild(createElement('div','text',text))
	var progressElement = textElement.appendChild(createElement('div','progress'))
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
	upload(event.dataTransfer.files)
}, false)


function upload(files){
	var xhr = new XMLHttpRequest()
	var formData = new FormData()
	Array.from(files).forEach(function(file, index){
		formData.append(index, file)
	})
	
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
			}, 1000)
		}
	}
	xhr.upload.onprogress = function(event){
		if(event.lengthComputable){ 
			notify('Uploading...', event.loaded / event.total)
		}
	}
	xhr.open('POST', uploadHost)
	xhr.setRequestHeader('directory', encodeURIComponent(path))
	xhr.send(formData)
}