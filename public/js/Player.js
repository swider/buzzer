(function(){
	$(function(){
		var
			client = new Faye.Client('/faye', {
				timeout: 120
			}),
			$buzz = $("#buzz"),
			$first = $("#first"),
			buzzIn = function(e){
				console.log('Buzzed in!');
				client.publish('/buzz', {
					user: buzzer.user
				});
				e.preventDefault();
			},
			showFirst = function(msg){
				$buzz.hide();
				$first.text(msg.user).show();
			}
			pointsAwarded = function(msg){
				onsole.log(msg.pts+" Points Awarded to "+msg.user);
			}
			reset = function(msg){
				$buzz.show();
				$first.hide();
			};

		client.subscribe('/buzz', showFirst);
		client.subscribe('/points', pointsAwarded);
		client.subscribe('/reset', reset);
		$buzz.click(buzzIn);

		client.publish('/join', {
			user: buzzer.user
		});
	});
})();
