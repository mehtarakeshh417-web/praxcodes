
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'school', 'teacher', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Schools table
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    state TEXT DEFAULT '',
    city TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    logo TEXT,
    sections TEXT[] DEFAULT ARRAY['A'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Teachers table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT '',
    classes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    father_name TEXT DEFAULT '',
    class TEXT DEFAULT '',
    section TEXT DEFAULT 'A',
    roll_no TEXT DEFAULT '',
    xp INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- User security (PIN, security question)
CREATE TABLE public.user_security (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    pin TEXT NOT NULL,
    security_question TEXT NOT NULL,
    security_answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for schools
CREATE POLICY "Admins can manage all schools" ON public.schools FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Schools can view own record" ON public.schools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Schools can update own record" ON public.schools FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for teachers
CREATE POLICY "Admins can manage all teachers" ON public.teachers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Schools can manage own teachers" ON public.teachers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.schools WHERE schools.id = teachers.school_id AND schools.user_id = auth.uid())
);
CREATE POLICY "Teachers can view own record" ON public.teachers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can update own record" ON public.teachers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for students
CREATE POLICY "Admins can manage all students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Schools can manage own students" ON public.students FOR ALL USING (
    EXISTS (SELECT 1 FROM public.schools WHERE schools.id = students.school_id AND schools.user_id = auth.uid())
);
CREATE POLICY "Teachers can view own students" ON public.students FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.teachers WHERE teachers.id = students.teacher_id));
CREATE POLICY "Teachers can update own students" ON public.students FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.teachers WHERE teachers.id = students.teacher_id));
CREATE POLICY "Students can view own record" ON public.students FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for user_security
CREATE POLICY "Users can manage own security" ON public.user_security FOR ALL USING (auth.uid() = user_id);
