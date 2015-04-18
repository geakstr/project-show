var Video = (function() {
	function Video() {
        this.hostname = window.location.hostname;
		this.client = new BinaryClient('ws://' + this.hostname + ':9000');
		
		
		
		//this.setupList();
		//this.setupDragDrop();
	}
	return Video;
})();

module.exports = Video;