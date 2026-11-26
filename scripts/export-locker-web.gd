extends Node

func export_model(job: Dictionary):
	if job.has("face_assets"):
		_export_faces(job["face_assets"])
		get_tree().quit()
		return
	for item in job.get("jobs", [job]):
		await _export_one(item)
		get_parent().started = Time.get_ticks_msec()
	get_tree().quit()

func _export_one(job: Dictionary):
	var cfg = CharacterConfig.from_dict(job.get("config", {}))
	var shown = cfg.gym_look() if job.get("outfit", "uniform") != "uniform" else cfg
	var kit = cfg.gym_kit() if job.get("outfit", "uniform") != "uniform" else cfg.uniform_kit()
	await CharacterPortrait.render(shown, "full_hd", Vector2i.ZERO, null, kit)
	var body = CharacterPortrait._rig["body"]
	var model = body._model
	var root = Node3D.new()
	root.name = "Player"
	get_tree().root.add_child(root)
	var count = 0
	for node in body.find_children("*", "MeshInstance3D", true, false):
		var mi = node as MeshInstance3D
		if model._shells.values().has(mi) or model._hl_shells.values().has(mi) or String(mi.name).to_lower().contains("outline"):
			continue
		if mi.mesh == null:
			continue
		if not mi.is_visible_in_tree() and not (job.get("part", "all") == "body" and (String(mi.name) in ["kneepad_l", "kneepad_r", "hoodmesh"])):
			continue
		var copy = MeshInstance3D.new()
		var part = "body"
		if model._face_root != null and model._face_root.is_ancestor_of(mi): part = "face"
		if model._hair_root != null and model._hair_root.is_ancestor_of(mi): part = "hair"
		if model._facial_root != null and model._facial_root.is_ancestor_of(mi): part = "beard"
		for slot in model._acc_roots:
			var mount = model._acc_roots[slot]
			if mount != null and (mount == mi or mount.is_ancestor_of(mi)): part = "accessory"
		var wanted = job.get("part", "all")
		if wanted != "all" and part != wanted and not (wanted == "body" and part == "face"):
			continue
		copy.name = part + "__" + String(mi.name) + "__" + str(count)
		count += 1
		copy.mesh = _bake_shapes(mi)
		root.add_child(copy)
		copy.global_transform = mi.global_transform
		for surface in copy.mesh.get_surface_count():
			var source = mi.get_active_material(surface)
			var material = StandardMaterial3D.new()
			material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
			material.roughness = 1.0
			var slot = String(model._surface_slots.get(mi, {}).get(surface, part))
			if part == "face": slot = "face_tex"
			material.resource_name = slot
			if part == "hair": material.resource_name = "hair_slot_" + str(model._hair_mats.find(source))
			if part == "beard": material.resource_name = "beard_slot_" + str(model._facial_mats.find(source))
			if source is ShaderMaterial:
				if String(mi.name).to_lower().contains("outline") or source.shader.code.contains("cull_front"):
					material.resource_name = "outline"
					material.albedo_color = Color.BLACK
					material.cull_mode = BaseMaterial3D.CULL_FRONT
				var hidden = source.get_shader_parameter("hidden")
				if hidden is float and hidden > 0.5:
					material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
					material.albedo_color.a = 0.0
				var color = source.get_shader_parameter("albedo")
				if color is Color:
					material.albedo_color = color
					if hidden is float and hidden > 0.5: material.albedo_color.a = 0.0
				for key in ["face_tex", "number_tex"]:
					var tex = source.get_shader_parameter(key)
					if tex is Texture2D:
						material.albedo_texture = ImageTexture.create_from_image(tex.get_image())
						material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
						material.resource_name = key
			elif source is StandardMaterial3D:
				material = source.duplicate()
				material.resource_name = slot
				if material.albedo_texture != null:
					material.albedo_texture = ImageTexture.create_from_image(material.albedo_texture.get_image())
			copy.set_surface_override_material(surface, material)
	var document = GLTFDocument.new()
	var state = GLTFState.new()
	var error = document.append_from_scene(root, state)
	if error == OK: error = document.write_to_filesystem(state, job["output"])
	print("WEB_EXPORT=", error, " meshes=", count)
	root.queue_free()
	await get_tree().process_frame

func _export_faces(folder: String):
	DirAccess.make_dir_recursive_absolute(folder)
	var result = {}
	var blush = []
	for key in ["circle", "dashes", "band", "freckles", "aublush", "blushwhisk", "swirl"]:
		var tex = ModelRig._blush_texture(key)
		var left = ModelRig._blush_half_center(key, false)
		var right = ModelRig._blush_half_center(key, true)
		var entry = {"key":key,"left":[left.x,left.y],"right":[right.x,right.y]}
		if tex != null:
			tex.get_image().save_png(folder + "/blush-" + key + ".png")
			entry["base"] = "/models/locker/faces/blush-" + key + ".png"
		blush.append(entry)
	result["blush"] = blush
	for kind in ["eyes", "brows", "nose", "mouth"]:
		var entries = []
		for i in FaceParts.count(kind):
			var center = FaceParts.used_center(kind, i)
			var right = FaceParts.right_half_center(kind, i)
			var left = FaceParts.half_center(kind, i, false)
			var entry = {"center":[center.x,center.y],"right":[right.x,right.y],"left":[left.x,left.y],"both":FaceParts.keeps_both_halves(kind,i)}
			for layer in ["base", "tint", "line", "lash"]:
				var tex = FaceParts.texture(kind, i) if layer == "base" else (FaceParts.tint_texture(kind,i) if layer == "tint" else FaceParts.layer_texture(kind,i,layer))
				if tex != null:
					var filename = kind + "-" + str(i) + "-" + layer + ".png"
					tex.get_image().save_png(folder + "/" + filename)
					entry[layer] = "/models/locker/faces/" + filename
			entries.append(entry)
		result[kind] = entries
	FileAccess.open(folder + "/index.json",FileAccess.WRITE).store_string(JSON.stringify(result))

func _bake_shapes(mi: MeshInstance3D):
	var original = mi.mesh as ArrayMesh
	if original == null: return mi.mesh
	if mi.skin == null: return original.duplicate()
	var plain = ArrayMesh.new()
	for i in original.get_surface_count():
		plain.add_surface_from_arrays(original.surface_get_primitive_type(i), original.surface_get_arrays(i))
	mi.mesh = plain
	var base = mi.bake_mesh_from_current_skeleton_pose()
	var result = ArrayMesh.new()
	result.blend_shape_mode = Mesh.BLEND_SHAPE_MODE_NORMALIZED
	for b in original.get_blend_shape_count(): result.add_blend_shape(original.get_blend_shape_name(b))
	var baked_shapes = []
	for b in original.get_blend_shape_count():
		var variant = ArrayMesh.new()
		for i in original.get_surface_count():
			var arrays = original.surface_get_arrays(i).duplicate(true)
			var shape = original.surface_get_blend_shape_arrays(i)[b]
			for key in [Mesh.ARRAY_VERTEX, Mesh.ARRAY_NORMAL, Mesh.ARRAY_TANGENT]:
				if shape[key] != null and shape[key].size() > 0:
					if original.blend_shape_mode == Mesh.BLEND_SHAPE_MODE_RELATIVE:
						for v in arrays[key].size(): arrays[key][v] += shape[key][v]
					else: arrays[key] = shape[key]
			variant.add_surface_from_arrays(original.surface_get_primitive_type(i), arrays)
		mi.mesh = variant
		baked_shapes.append(mi.bake_mesh_from_current_skeleton_pose())
	for i in base.get_surface_count():
		var shapes = []
		for variant in baked_shapes:
			var shape = variant.surface_get_arrays(i)
			for key in shape.size():
				if key not in [Mesh.ARRAY_VERTEX, Mesh.ARRAY_NORMAL, Mesh.ARRAY_TANGENT]: shape[key] = null
			shapes.append(shape)
		result.add_surface_from_arrays(base.surface_get_primitive_type(i), base.surface_get_arrays(i), shapes)
	mi.mesh = original
	return result
