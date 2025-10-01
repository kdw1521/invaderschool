export type Teacher = { id: string; name: string; created_at: string };
export type Cohort  = { id: number; teacher_id: string; name: string; created_at: string };

async function j<R>(r: Response): Promise<R> {
  if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
  return r.json();
}

export const TeachersAPI = {
  list: () => fetch("/api/teachers", { cache: "no-store" }).then(j<Teacher[]>),
  create: (name: string) =>
    fetch("/api/teachers", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name }) }).then(j<Teacher>),
  remove: (id: string) =>
    fetch(`/api/teachers/${id}`, { method: "DELETE" }).then(j<{ok:true}>),
};

export const CohortsAPI = {
  list: () => fetch("/api/teacher-cohorts", { cache: "no-store" }).then(j<Cohort[]>),
  create: (teacher_id: string, name: string) =>
    fetch("/api/teacher-cohorts", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ teacher_id, name }) }).then(j<Cohort>),
  remove: (id: number) =>
    fetch(`/api/teacher-cohorts/${id}`, { method: "DELETE" }).then(j<{ok:true}>),
};
