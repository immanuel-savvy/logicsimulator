const charset =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const gen_random_int = (max_int, min_int = 0) =>
  min_int + Math.floor(Math.random() * max_int);

const _id = (folder) => {
  let random_value = "";
  for (let i = 0; i < gen_random_int(32, 12); i++)
    random_value += charset[gen_random_int(charset.length)];

  return `${folder}~${random_value}~${Date.now()}`;
};

const is_child_of = (
  target,
  parent,
  by = "class_name",
  include_target = true
) => {
  let child_element, parent_element;
  if (by === "class_name") {
    if (include_target && target.classList.contains(parent)) return target;

    child_element = target;
    while (true) {
      parent_element = child_element.parentElement;
      if (!parent_element) return;

      if (parent_element.classList.contains(parent)) return parent_element;
      child_element = parent_element;
    }
  }

  if (by === "id") {
    if (include_target && target.id.split(" ").includes(parent)) return target;

    child_element = target;
    while (true) {
      parent_element = child_element.parentElement;
      if (!parent_element) return;

      if (parent_element.id.split(" ").includes(parent)) return parent_element;
      child_element = parent_element;
    }
  }
};

const round_nearest_20 = (num) => {
  return Math.round(num / 20) * 20;
};

const copy_object = (object) => {
  if (!object) return object;

  if (typeof object !== "object") return object;

  let object_;
  if (Array.isArray(object)) {
    object_ = new Array(...object).map((obj) => copy_object(obj));
  } else {
    object_ = {};
    for (const key in object) {
      object_[key] = copy_object(object[key]);
    }
  }
  return object_;
};

export {
  _id,
  gen_random_int,
  charset,
  is_child_of,
  round_nearest_20,
  copy_object,
};
