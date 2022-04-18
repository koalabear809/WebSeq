const colorScheme = {
	lightgrey: "#EDEDED",
	grey: "#9E9E9E",
	lemon: "#FFF84C",
	green: "#178723",
	red: "#D1001D"
}

const genericButton = {
	style: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "70px",
		height: "30px",
		borderRadius: "5px",
		margin: "10px",
		border: "1px solid #9e9e9e",
		backgroundColor: "#EDEDED"
	},
	onmouseover: function(){
		setStyle(this, {
			border: "1px solid #D1001D"
		});
	},
	onmouseleave: function(){
		setStyle(this, {
			border: "1px solid #9e9e9e"
		});
	}
}
