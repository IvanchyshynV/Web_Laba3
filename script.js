(function () {
	const blocks_count = document.getElementById('blocks_count');
	const add_btn = document.getElementById('add_blocks');
	const clear_blocks = document.getElementById('clear_blocks');
	let i = 0;
	function getRandomColor() {
	  let letters = '0123456789ABCDEF';
	  let color = '#';
	  for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}
	
	Packery.prototype.getShiftPositions = function (attrName) {
		attrName = attrName || "id";
		var _this = this;
		return this.items.map(function (item) {
			return {
				attr: item.element.getAttribute(attrName),
				x: item.rect.x / _this.packer.width,
				color: item.element.getAttribute("data-color")
			};
		});
	};

	Packery.prototype.initShiftLayout = function (positions, attr) {
		if (!positions) {
			this.layout();
			return;
		}

		if (typeof positions == "string") {
			try {
				positions = JSON.parse(positions);				
			} catch (error) {
				console.error("JSON parse error: " + error);
				this.layout();
				return;
			}
		}

		attr = attr || "id";
		this._resetLayout();
		this.items = positions.map(function (itemPosition) {
			var selector = "[" + attr + '="' + itemPosition.attr + '"]';
			var itemElem = this.element.querySelector(selector);
			var item = this.getItem(itemElem);
			item.rect.x = itemPosition.x * this.packer.width;
			return item;
		}, this);
		this.shiftLayout();
	};
	
	if (localStorage.getItem("dragPositions")) {
		add_btn.setAttribute("disabled", "disabled");
		clear_blocks.removeAttribute("disabled", "disabled");
		JSON.parse(localStorage.getItem("dragPositions")).forEach(pos => {
			console.log(pos);
			document.querySelector('.grid').insertAdjacentHTML('beforeend' ,`
				<div class="grid-item" data-item-id="${pos.attr}" data-color="${pos.color}" style="background-color:${pos.color};">${pos.attr}</div>
			`);
		});
		activateGrid(document.querySelectorAll('.grid-item'));
	} else {
		clear_blocks.setAttribute("disabled", "disabled");
	}
	
	add_btn.addEventListener('click', () => {
		clear_blocks.removeAttribute("disabled", "disabled");
		let items = [];
		
		if (document.querySelectorAll(".grid-item").length == 0) {
			i = 1;
		} else {
			i = parseInt(document.querySelector(".grid-item:last-child").dataset.itemId)+1;
		}
		let gridItem = document.createElement("div");
			gridItem.dataset.itemId = i;
			gridItem.dataset.color = getRandomColor();
			gridItem.style.backgroundColor = gridItem.dataset.color;
			gridItem.textContent = i;
			gridItem.classList.add('grid-item');
			items.push(gridItem);
		
		activateGrid(items);
	});
	clear_blocks.addEventListener('click', () => {
		document.querySelector(".grid").innerHTML = "";
		localStorage.removeItem('dragPositions');
		window.location.reload();
	})

	function activateGrid(elements = null) {
		let options = {
			itemSelector: ".grid-item",
			columnWidth: ".grid-sizer",
			initLayout: true
		};
		let $grid = $(".grid").packery(options);
		if (elements != null) {
			$grid.append(elements).packery( 'appended', elements).packery('reloadItems');
		}
		
		if (localStorage.getItem("dragPositions")) {
			let initPositions = localStorage.getItem("dragPositions");
			$grid.packery("initShiftLayout", initPositions, "data-item-id");
		}
		
		$grid.find('.grid-item').each( function( i, gridItem ) {
		  var draggie = new Draggabilly( gridItem );
		  $grid.packery( 'bindDraggabillyEvents', draggie );
		});

		$grid.on("dragItemPositioned", function () {
			let positions = $grid.packery("getShiftPositions", "data-item-id");
			localStorage.setItem("dragPositions", JSON.stringify(positions));
			add_btn.setAttribute("disabled", "disabled");
		});
		
	}
})();
