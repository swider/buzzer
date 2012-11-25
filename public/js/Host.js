(function(){
	$(function(){
		var
			client = new Faye.Client('/faye', {
				timeout: 120
			}),
			$reset = $("#reset"),
			$first = $("#first"),
			reset = function(e){
				console.log('Resetting!');
				client.publish('/reset', {});
				$first.text()
				e.preventDefault();
			},
			showFirst = function(msg){
				$first.text(msg.user);
			};

		client.subscribe('/buzz', showFirst);
		$reset.click(reset);

	});
})();
