(function(){
	$(function(){
		var
			client = new Faye.Client('/faye', {
				timeout: 120
			}),
			$first = $("#first"),
			$changeRound = $('.changeRound'),
			$changePoints = $(".presetPtBtn"),
			customPointsSel = ".customPts"
			$customPointsBtn = $(".customPtBtn"),
			$reset = $("#reset"),
			$scoreboard = $('.scoreboard'),
			players = [],
			addUser = function(msg){
				if(msg.user == ''){ return false; }
				players[msg.user] = 0;
				updateScoreboard();
			},
			showFirst = function(msg){
				$first.text(msg.user);
			},
			changeRound = function(e){
				$('.changePoints').addClass('hide');
				$('.changePoints.round'+$(this).data('round')).removeClass('hide');
				e.preventDefault();
			},
			changePoints = function(e){
				if ($first.text() == '') { return false; }
				var diff = $(this).data('amount');
				players[$first.text()] += diff;
				updateScoreboard();
				client.publish('/points', {user: $first.text(), pts: diff, scoreboard: players});
				e.preventDefault();
			},
			customPoints = function(e){
				if ($first.text() == '') { return false; }
				var 
					$this = $(this),
					diff = Math.abs(Math.floor($this.siblings(customPointsSel).val()));
				if($this.hasClass('sub')){ diff = diff*-1; }
				client.publish('/points', {user: $first.text(), pts: diff});
				players[$first.text()] += diff;
				updateScoreboard();
				e.preventDefault();
			},
			reset = function(e){
				console.log('Resetting!');
				client.publish('/reset', {});
				$first.text('')
				e.preventDefault();
			},
			updateScoreboard = function(){
				var newhtml = '<tr><th>Name</th><th>Points</th></tr>';
				players.sort();
				for(var user in players) {
					newhtml += '<tr><td class="name">'+user+'</td>';
					newhtml += '<td class="points">'+players[user]+'</td></tr>';
				}
				$scoreboard.html(newhtml);
			};

		client.subscribe('/join', addUser);
		client.subscribe('/buzz', showFirst);
		$changeRound.click(changeRound);
		$changePoints.click(changePoints);
		$customPointsBtn.click(customPoints);
		$reset.click(reset);


	});
})();
