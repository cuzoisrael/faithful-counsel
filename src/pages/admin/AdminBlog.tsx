import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  post_type: string;
  status: string;
  author: string | null;
  featured: boolean;
  created_at: string;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", post_type: "blog", content: "", excerpt: "", author: "", category: "" });

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("id, title, slug, post_type, status, author, featured, created_at").order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === "published") update.published_at = new Date().toISOString();
    const { error } = await supabase.from("blog_posts").update(update).eq("id", id);
    if (error) { toast.error("Update failed"); return; }
    toast.success(`Post ${status}`);
    fetchPosts();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("blog_posts").insert({
      title: form.title,
      slug,
      post_type: form.post_type,
      content: form.content,
      excerpt: form.excerpt,
      author: form.author || null,
      category: form.category || null,
      status: "draft",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Post created");
    setShowForm(false);
    setForm({ title: "", slug: "", post_type: "blog", content: "", excerpt: "", author: "", category: "" });
    fetchPosts();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast.success("Deleted");
    fetchPosts();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Manage Blog Posts</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            <input placeholder="Slug (auto-generated)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
            <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputClass} />
            <select value={form.post_type} onChange={(e) => setForm({ ...form, post_type: e.target.value })} className={inputClass}>
              <option value="blog">Blog</option>
              <option value="resource">Resource</option>
              <option value="devotional">Devotional</option>
              <option value="event">Event</option>
            </select>
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
          </div>
          <input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inputClass} />
          <textarea placeholder="Full content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className={inputClass} />
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {["Title", "Type", "Author", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3 text-foreground capitalize">{p.post_type}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.author || "—"}</td>
                <td className="px-4 py-3">
                  <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)} className="text-xs border border-input rounded px-2 py-1 bg-card text-foreground">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(p.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <p className="text-center text-muted-foreground py-8">No posts yet.</p>}
      </div>
    </div>
  );
};

export default AdminBlog;
