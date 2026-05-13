import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import PageTransition from "@/components/shared/PageTransition";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Bookings from "./pages/Bookings";
import Testimonials from "./pages/Testimonials";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminConferences from "./pages/admin/AdminConferences";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminCounselors from "./pages/admin/AdminCounselors";
import Payment from "./pages/Payment";
import Resources from "./pages/Resources";
import Counselors from "./pages/Counselors";
import IntakeForm from "./pages/IntakeForm";
import AdminAccess from "./pages/AdminAccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/counselors" element={<Counselors />} />
              <Route path="/intake/:bookingId" element={<IntakeForm />} />
              <Route path="/admin-access" element={<AdminAccess />} />
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="conferences" element={<AdminConferences />} />
                <Route path="counselors" element={<AdminCounselors />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
