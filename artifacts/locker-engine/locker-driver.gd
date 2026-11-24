extends Node

var started: int
var request_path: String = ""
const PREVIEW_IDLE_MS = 8000
const PREVIEW_LIFETIME_MS = 60000
func _ready():
	started = Time.get_ticks_msec()
	if not OS.get_user_data_dir().ends_with("CodexJVLocker"):
		_fail("Renderer isolation failed.")
		return
	var args = OS.get_cmdline_user_args()
	if args.size() != 1:
		_fail("One request path is required.")
		return
	request_path = args[0]
	get_tree().root.set_flag(Window.FLAG_NO_FOCUS, true)
	call_deferred("_render")

func _process(_delta):
	if Time.get_ticks_msec() - started > 55000:
		_fail("Rendering timed out.")

func _fail(message: String):
	print("LOCKER_ERROR=", message)
	get_tree().quit(2)

func _render():
	for child in get_tree().root.get_children():
		if child != self:
			child.process_mode = Node.PROCESS_MODE_DISABLED
	var request = JSON.parse_string(FileAccess.get_file_as_string(request_path))
	if not request is Dictionary:
		_fail("Invalid request.")
		return
	if request.get("catalog", false):
		await _render_catalog(request)
		return
	if request.get("shop_assets", false):
		await _render_shop_assets(request)
		return
	if request.get("previewWorker", false):
		print("LOCKER_PREVIEW_WORKER")
	await _render_preview(request)
	if request.get("previewWorker", false):
		await _serve_preview_queue()
	get_tree().quit()

func _serve_preview_queue() -> void:
	var folder = request_path.get_base_dir()
	var next_path = folder + "/next.json"
	var deadline = started + PREVIEW_LIFETIME_MS
	var idle_since = Time.get_ticks_msec()
	while Time.get_ticks_msec() < deadline and Time.get_ticks_msec() - idle_since < PREVIEW_IDLE_MS:
		if not FileAccess.file_exists(next_path):
			await get_tree().create_timer(0.02).timeout
			continue
		var next = JSON.parse_string(FileAccess.get_file_as_string(next_path))
		DirAccess.remove_absolute(next_path)
		if not next is Dictionary:
			_fail("Invalid request.")
			return
		started = Time.get_ticks_msec()
		await _render_preview(next)
		idle_since = Time.get_ticks_msec()

func _render_preview(request: Dictionary) -> void:
	var cfg: CharacterConfig
	if String(request.get("code", "")) != "":
		cfg = LookShare.decode(String(request.code))
	else:
		cfg = CharacterConfig.from_dict(request.get("config", {}))
	if cfg == null:
		_fail("This appearance code cannot be decoded by game 1.0.3.")
		return
	var exported = LookShare.encode(cfg)
	# Export exactly as the game does; re-import to show the saved code's
	# quantized values, rather than an unexportable higher precision config.
	cfg = LookShare.decode(exported)
	if cfg == null:
		_fail("Export round-trip failed.")
		return
	for slot in CharacterConfig.ACC_SLOTS:
		var item_id = cfg.acc_id(slot)
		if item_id != "" and AccessoryCatalog.by_id(item_id) == null:
			_fail("This accessory is not enabled in game 1.0.3: " + item_id)
			return
	var normalized = cfg.to_dict()
	var kit: Array = cfg.uniform_kit()
	var shown = cfg
	var outfit = String(request.get("outfit", "uniform"))
	if outfit != "uniform":
		shown = cfg.gym_look()
		kit = cfg.gym_kit()
		if outfit == "pinny":
			shown.wear_pinny = true
			shown.pinny_color = cfg.captain_kit[0]
			shown.pinny_accent = TeamKits.number_ink(shown.pinny_color)
	CharacterPortrait.locker_yaw = float(request.get("yaw", 0.0))
	CharacterPortrait.locker_pitch = float(request.get("pitch", 0.0))
	var preset = "head" if String(request.get("view", "full")) == "head" else "full_hd"
	var texture = await CharacterPortrait.render(shown, preset, Vector2i.ZERO, null, kit)
	if texture == null or CharacterPortrait._rig.body._model == null:
		_fail("The original player model could not be rendered.")
		return
	var image = texture.get_image()
	if image == null or image.get_used_rect().size.x < 8:
		_fail("The renderer returned an empty portrait.")
		return
	var folder = request_path.get_base_dir()
	var png = LookShare.png_with_code(image, exported)
	if LookShare.code_in_png_bytes(png) != exported:
		_fail("PNG appearance-code round-trip failed.")
		return
	var picture = FileAccess.open(folder + "/portrait.png", FileAccess.WRITE)
	if picture == null:
		_fail("Could not save the portrait.")
		return
	picture.store_buffer(png)
	picture.close()
	var required: Array = []
	for slot in CharacterConfig.ACC_SLOTS:
		var id = cfg.acc_id(slot)
		if id != "" and not required.has(id):
			required.append(id)
	var bounds = image.get_used_rect()
	var result = {"config": normalized, "code": exported, "requiredAccessories": required,
		"alphaBounds":[bounds.position.x,bounds.position.y,bounds.end.x,bounds.end.y],
		"missingAccessories": required, "rendererInfo": {"resourceVersion":"1.0.3", "engine":Engine.get_version_info().string,
		"modelPath":ModelRig.model_path(), "method":"Original CharacterConfig / ModelRig / CharacterPortrait / LookShare",
		"ownershipChecked":false, "liveGameParityVerified":false, "pngCodeEmbedded":true}, "width":image.get_width(), "height":image.get_height()}
	if request.get("orbitAtlas", false):
		var atlas = await _render_orbit_atlas(preset, folder + "/orbit.webp")
		if atlas.is_empty():
			_fail("The orbit atlas could not be rendered.")
			return
		result["orbitAtlas"] = atlas
	var file = FileAccess.open(folder + "/result.json", FileAccess.WRITE)
	if file == null:
		_fail("Could not save the result.")
		return
	file.store_string(JSON.stringify(result))
	file.close()
	print("LOCKER_RENDER_COMPLETE")

func _render_orbit_atlas(preset: String, output: String) -> Dictionary:
	var rig = CharacterPortrait._rig
	var vp: SubViewport = rig["vp"]
	var cam: Camera3D = rig["cam"]
	var body: Player = rig["body"]
	var framing: Dictionary = CharacterPortrait.PRESETS[preset]
	var look: Vector3 = framing["look"]
	var distance = float(framing["dist"])
	var cell = Vector2i(480, 480 if preset == "head" else 624)
	var columns = 24
	var pitches = [-50, -35, -20, 0, 20, 35, 50]
	var atlas = Image.create_empty(cell.x * columns, cell.y * pitches.size(), false, Image.FORMAT_RGBA8)
	# Render at the delivered frame resolution instead of reading back a full
	# 960px portrait and discarding three quarters of its pixels for every view.
	vp.size = cell
	if GameConfig.contour_outline:
		body.set_contour_px_scale(CharacterPortrait.PORTRAIT_CONTOUR_SCALE * float(cell.x) / float(framing["vp"].x))
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	for row in pitches.size():
		var offset = Vector3(0.0, 0.0, distance).rotated(Vector3.LEFT, deg_to_rad(pitches[row]))
		cam.global_position = look + offset
		cam.look_at(look)
		for column in columns:
			body.visual.rotation.y = TAU * column / columns
			await RenderingServer.frame_post_draw
			var tile = vp.get_texture().get_image()
			if tile == null:
				vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
				return {}
			tile.convert(Image.FORMAT_RGBA8)
			atlas.blit_rect(tile, Rect2i(Vector2i.ZERO, cell), Vector2i(column * cell.x, row * cell.y))
	vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
	if atlas.save_webp(output, true, 0.95) != OK:
		return {}
	return {"columns": columns, "pitches": pitches, "width": cell.x, "height": cell.y}

func _render_shop_assets(request: Dictionary) -> void:
	var folder = request_path.get_base_dir()
	var base = CharacterConfig.from_dict(request.get("config", {}))
	var preview = await CharacterPortrait.render(base, "full_hd", Vector2i.ZERO, null, base.uniform_kit())
	if not _save_shop_image(preview, folder + "/player.png"):
		return
	for id in request.get("accessories", []):
		var item = AccessoryCatalog.by_id(id)
		if item == null:
			_fail("Unknown Shop accessory: " + id)
			return
		var shot = base.acc_alone(item.category, id)
		shot.reset_acc_transform(item.category)
		var colors = item.default_colors()
		for i in colors.size():
			shot.set_acc_color(item.category, i, colors[i])
		var tile = await CharacterPortrait.render(shot, item.portrait_preset())
		if not _save_shop_image(tile, folder + "/" + id + ".png"):
			return
	print("LOCKER_SHOP_ASSETS_COMPLETE")
	get_tree().quit()

func _save_shop_image(texture: ImageTexture, path: String) -> bool:
	if texture == null:
		_fail("Missing Shop artwork: " + path.get_file())
		return false
	var image = texture.get_image()
	var bounds = image.get_used_rect()
	if bounds.size.x < 8 or bounds.size.y < 8 or image.get_region(bounds).save_png(path) != OK:
		_fail("Failed to save Shop artwork: " + path.get_file())
		return false
	return true

func _render_catalog(request: Dictionary):
	var folder = request_path.get_base_dir()
	DirAccess.make_dir_recursive_absolute(folder + "/thumbs")
	var records: Array = []
	var wanted: String = String(request.get("catalogKind", "all"))
	var ids: Array = request.get("ids", [])
	CharacterPortrait.locker_yaw = 0.0
	for kind in ["hair", "beard"]:
		if wanted != "all" and wanted != kind:
			continue
		var styles: Array = CharacterConfig.hair_meshes() if kind == "hair" else CharacterConfig.facial_hair_meshes()
		for index in styles.size():
			var id: String = String(styles[index])
			if not ids.is_empty() and not ids.has(id):
				continue
			var cfg: CharacterConfig = CharacterConfig.new()
			cfg.hair_col = Color.html("d84236")
			cfg.hair_cols = []
			cfg.hair_grads = []
			cfg.accessories = {}
			if kind == "hair":
				cfg.hair = index
			else:
				cfg.hair = 0
				cfg.facial_hair = index
			var texture = await CharacterPortrait.render(cfg, "head")
			if texture == null or CharacterPortrait._rig.body._model == null:
				_fail("Catalog model failed: " + kind + "/" + id)
				return
			var image = texture.get_image()
			if image == null or image.get_used_rect().size.x < 8 or image.get_used_rect().size.y < 8:
				_fail("Empty catalog image: " + kind + "/" + id)
				return
			var slug: String = id if id != "" else ("bald" if kind == "hair" else "none")
			var filename: String = kind + "-" + slug + ".png"
			if image.save_png(folder + "/thumbs/" + filename) != OK:
				_fail("Could not save catalog image: " + filename)
				return
			records.append({"kind":kind,"id":id,"file":filename,"config":cfg.to_dict(),"width":image.get_width(),"height":image.get_height(),"usedRect":str(image.get_used_rect())})
			started = Time.get_ticks_msec()
			print("LOCKER_CATALOG_SAVED=", filename)
	if wanted == "kit":
		for index in TeamKits.KIT_STYLE_NAMES.size():
			var id: String = str(index)
			if not ids.is_empty() and not ids.has(id):
				continue
			var cfg: CharacterConfig = CharacterConfig.new()
			cfg.hair = 0
			cfg.number = 43
			cfg.captain_kit = [Color.html("7767de"), Color.html("17171c"), Color.html("ffd23f"), Color.WHITE]
			cfg.kit_style = index
			var texture = await CharacterPortrait.render(cfg, "full", Vector2i.ZERO, null, cfg.uniform_kit())
			if texture == null or CharacterPortrait._rig.body._model == null:
				_fail("Kit catalog model failed: " + id)
				return
			var image = texture.get_image()
			if image == null or image.get_used_rect().size.x < 8 or image.get_used_rect().size.y < 8:
				_fail("Empty kit catalog image: " + id)
				return
			var filename: String = "kit-" + id + ".png"
			if image.save_png(folder + "/thumbs/" + filename) != OK:
				_fail("Could not save kit catalog image: " + filename)
				return
			records.append({"kind":"kit","id":id,"file":filename,"config":cfg.to_dict(),"width":image.get_width(),"height":image.get_height(),"usedRect":str(image.get_used_rect())})
			started = Time.get_ticks_msec()
			print("LOCKER_CATALOG_SAVED=", filename)
	var file = FileAccess.open(folder + "/catalog-result.json", FileAccess.WRITE)
	if file == null:
		_fail("Could not save catalog results.")
		return
	file.store_string(JSON.stringify({"items":records,"engine":Engine.get_version_info().string,"modelPath":ModelRig.model_path(),"preset":"full" if wanted == "kit" else "head","method":"CharacterConfig.new + CharacterPortrait.render; original game resources"}))
	file.close()
	print("LOCKER_RENDER_COMPLETE")
	get_tree().quit()
