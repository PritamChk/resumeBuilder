"use client";

import { useState, useEffect, forwardRef, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Plus, Trash2, FileText, Download, Copy, Check, Zap, ZapOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
type FormValues = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  summary: string;
  experience: { company: string; title: string; location: string; date: string; bullets: string[] }[];
  projects: { name: string; tech_stack: string; date: string; bullets: string[] }[];
  skills: { category: string; skills: string }[];
  education: { institution: string; degree: string; location: string; date: string }[];
};

const defaultValues: FormValues = {
  name: "PRITAM CHAKRABORTY",
  email: "pritamchakraborty2017@gmail.com",
  phone: "9836424024",
  linkedin: "https://www.linkedin.com/in/pritam98",
  github: "https://github.com/PritamChk",
  location: "Bangalore, India",
  summary: "Results-driven DevOps Engineer with 3.5+ years of experience specializing in AWS infrastructure automation and scalable CI/CD pipelines. Proven track record in observability, performance tuning, and reducing MTTR by 55% through proactive monitoring and log aggregation. Committed to the HEART values of being Humble, Effective, Adaptable, Remarkable, and Transparent.",
  experience: [
    {
      company: "Tata Consultancy Services (TCS)",
      title: "DevOps Engineer / System Engineer",
      location: "Bangalore, India",
      date: "August 2022 -- Present",
      bullets: [
        "Engineered an AWS RDS read-replica architecture that achieved an 80% reduction in application response time and restored SLA compliance through rigorous performance tuning.",
        "Architected an AWS Disaster Recovery (DR) solution aligned with RTO/RPO objectives using multi-AZ deployments.",
        "Improved incident visibility and reduced MTTR by 55% by implementing centralized logging and monitoring with Prometheus, Grafana, and Loki (ELK-style log aggregation)."
      ]
    }
  ],
  projects: [
    {
      name: "AWS Infrastructure Provisioning",
      tech_stack: "Terraform, VPC Endpoints, ASG",
      date: "January 2026",
      bullets: [
        "Developed reusable Terraform modules to orchestrate networking and compute resources, ensuring secure and scalable traffic management for high-traffic applications."
      ]
    }
  ],
  skills: [
    { category: "Cloud/IaC", skills: "AWS (RDS, Route 53, ALB, EKS), Terraform, Ansible, CloudWatch, Azure (Basics)" },
    { category: "CI/CD/Tools", skills: "Jenkins, GitLab CI/CD, Docker, Kubernetes, Maven, JFrog, GitHub Actions" }
  ],
  education: [
    {
      institution: "Techno Main Salt Lake",
      degree: "Master of Computer Applications (MCA) -- GPA: 9.83/10",
      location: "Kolkata, WB",
      date: "August 2020 -- July 2022"
    }
  ]
};

export default function ResumeBuilder() {
  const { register, control, watch, handleSubmit } = useForm<FormValues>({ defaultValues });
  const [activeTab, setActiveTab] = useState("Personal");
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [autoPreview, setAutoPreview] = useState(true);
  const requestIdRef = useRef(0);
  const currentBlobUrlRef = useRef<string | null>(null);

  const formValues = watch();

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    setError(null);
    
    // Increment request ID
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    try {
      const cleanedValues = {
        ...formValues,
        experience: formValues.experience.map(exp => ({
          ...exp,
          bullets: exp.bullets.filter(b => b.trim())
        })),
        projects: formValues.projects.map(proj => ({
          ...proj,
          bullets: proj.bullets.filter(b => b.trim())
        }))
      };
      
      const res = await axios.post(`${API_URL}/api/generate-pdf`, cleanedValues, {
        responseType: "blob",
      });

      // Only update if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        // Revoke old URL to prevent memory leak
        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
        }
        const url = URL.createObjectURL(res.data);
        currentBlobUrlRef.current = url;
        setPdfBlob(url);
      }
    } catch (error) {
      // Only update if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setError(`Failed to generate PDF. Make sure:\n1. Backend is running on ${API_URL}\n2. LaTeX/Tectonic binary is available\n3. All required fields are filled`);
        console.error("PDF Generation failed", error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  // Trigger on mount immediately, then debounce on changes
  const formJson = JSON.stringify(formValues);
  useEffect(() => {
    handleGeneratePreview();
  }, []); // On mount

  useEffect(() => {
    if (!autoPreview) return;
    const timer = setTimeout(() => {
      handleGeneratePreview();
    }, 3000); // Increased debounce to 3 seconds
    return () => clearTimeout(timer);
  }, [formJson, autoPreview]); // On changes

  const tabs = ["Personal", "Summary", "Experience", "Projects", "Skills", "Education"];

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full">
      {/* Left panel: Form */}
      <div className="w-full lg:w-1/2 glass-panel rounded-2xl flex flex-col overflow-hidden h-[85vh]">
        {/* Tabs */}
        <div className="flex bg-white/5 border-b border-white/10 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "Personal" && <PersonalInfo register={register} />}
              {activeTab === "Summary" && <SummaryInfo register={register} />}
              {activeTab === "Experience" && <ExperienceInfo control={control} register={register} />}
              {activeTab === "Projects" && <ProjectInfo control={control} register={register} />}
              {activeTab === "Skills" && <SkillInfo control={control} register={register} />}
              {activeTab === "Education" && <EducationInfo control={control} register={register} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right panel: Preview */}
      <div className="w-full lg:w-1/2 glass-panel rounded-2xl flex flex-col overflow-hidden h-[85vh]">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2 shrink-0">
            <FileText className="w-5 h-5 text-primary" /> Live Preview
          </h2>
          <div className="flex items-center gap-2">
            {/* Copy LaTeX */}
            <button
              onClick={async () => {
                try {
                  const res = await axios.post(`${API_URL}/api/generate-latex`, formValues);
                  await navigator.clipboard.writeText(res.data);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                } catch (e) {
                  alert("Failed to fetch LaTeX source.");
                }
              }}
              title="Copy LaTeX source"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg text-sm transition-all"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {isCopied ? "Copied!" : "LaTeX"}
            </button>

            {/* Download PDF */}
            {pdfBlob && (
              <a
                href={pdfBlob}
                download="resume.pdf"
                title="Download PDF"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <Download className="w-4 h-4" /> PDF
              </a>
            )}

            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoPreview(!autoPreview)}
              title={autoPreview ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all border ${
                autoPreview 
                  ? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" 
                  : "text-gray-400 border-white/10 hover:border-white/30"
              }`}
            >
              {autoPreview ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              Auto
            </button>

            {/* Force Refresh */}
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-primary/50 disabled:opacity-50"
            >
              {isGenerating ? "Compiling..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-900/50 relative flex flex-col">
          {pdfBlob ? (
            <iframe key={pdfBlob} src={pdfBlob + "#toolbar=0"} className="w-full h-full border-none rounded-b-2xl object-cover" />
          ) : (
            <div className="flex w-full h-full items-center justify-center text-gray-500">
              <p>Type in the form to generate a preview...</p>
            </div>
          )}
          
          {isGenerating && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-b-transparent"></div>
            </div>
          )}
          
          {error && !isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
              <div className="bg-red-900/80 border border-red-500 rounded-lg p-6 max-w-sm text-center">
                <p className="text-red-200 text-sm whitespace-pre-line">{error}</p>
                <button
                  onClick={handleGeneratePreview}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Example Form Component slices (Inlined for simplicity)
const PersonalInfo = ({ register }: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Input label="Full Name" {...register("name")} />
      <Input label="Email" {...register("email")} />
      <Input label="Phone" {...register("phone")} />
      <Input label="Location" {...register("location")} />
    </div>
    <Input label="LinkedIn URL" {...register("linkedin")} />
    <Input label="GitHub URL" {...register("github")} />
  </div>
);

const SummaryInfo = ({ register }: any) => (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-gray-300 mb-1">Professional Summary</label>
    <textarea
      {...register("summary")}
      className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[150px] text-sm"
    />
  </div>
);

const ExperienceInfo = ({ control, register }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: "experience" });
  return (
    <div className="space-y-6">
      {fields.map((item, index) => (
        <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4 relative group">
          <button onClick={() => remove(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
          <div className="grid grid-cols-2 gap-4 mr-8">
            <Input label="Company" {...register(`experience.${index}.company`)} />
            <Input label="Job Title" {...register(`experience.${index}.title`)} />
            <Input label="Location" {...register(`experience.${index}.location`)} />
            <Input label="Dates" {...register(`experience.${index}.date`)} />
          </div>
          <BulletList control={control} register={register} nestIndex={index} name="experience" />
        </motion.div>
      ))}
      <button onClick={() => append({ company: "", title: "", location: "", date: "", bullets: [""] })} className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors py-2"><Plus className="w-4 h-4" /> Add Experience</button>
    </div>
  );
};

const ProjectInfo = ({ control, register }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: "projects" });
  return (
    <div className="space-y-6">
      {fields.map((item, index) => (
        <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4 relative group">
          <button onClick={() => remove(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
          <div className="grid grid-cols-2 gap-4 mr-8">
            <Input label="Project Name" {...register(`projects.${index}.name`)} />
            <Input label="Technologies Used" {...register(`projects.${index}.tech_stack`)} />
            <Input label="Date" {...register(`projects.${index}.date`)} />
          </div>
          <BulletList control={control} register={register} nestIndex={index} name="projects" />
        </motion.div>
      ))}
      <button onClick={() => append({ name: "", tech_stack: "", date: "", bullets: [""] })} className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors py-2"><Plus className="w-4 h-4" /> Add Project</button>
    </div>
  );
};

const SkillInfo = ({ control, register }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });
  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 items-start">
          <div className="w-1/3"><Input label="Category" {...register(`skills.${index}.category`)} /></div>
          <div className="flex-1"><Input label="Skills (comma separated)" {...register(`skills.${index}.skills`)} /></div>
          <button onClick={() => remove(index)} className="mt-8 text-gray-500 hover:text-red-400"><Trash2 className="w-5 h-5"/></button>
        </motion.div>
      ))}
      <button onClick={() => append({ category: "", skills: "" })} className="text-primary text-sm flex items-center gap-2 pt-2"><Plus className="w-4 h-4"/> Add Skill Category</button>
    </div>
  );
};

const EducationInfo = ({ control, register }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: "education" });
  return (
    <div className="space-y-6">
      {fields.map((item, index) => (
        <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-black/20 border border-white/5 rounded-xl relative group gap-4 grid grid-cols-2">
          <Input label="Institution" {...register(`education.${index}.institution`)} />
          <Input label="Degree & GPA" {...register(`education.${index}.degree`)} />
          <Input label="Location" {...register(`education.${index}.location`)} />
          <Input label="Dates" {...register(`education.${index}.date`)} />
          <button onClick={() => remove(index)} className="absolute top-[-10px] right-[-10px] bg-red-500/20 text-red-400 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
        </motion.div>
      ))}
      <button onClick={() => append({ institution: "", degree: "", location: "", date: "" })} className="text-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4"/> Add Education</button>
    </div>
  );
};


// Custom Components
const Input = forwardRef(({ label, ...props }: any, ref: any) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">{label}</label>
    <input
      ref={ref}
      {...props}
      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
    />
  </div>
));
Input.displayName = 'Input';

const BulletList = ({ control, register, nestIndex, name }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.${nestIndex}.bullets`
  });

  return (
    <div className="space-y-2 mt-2">
      <label className="text-xs text-gray-400 ml-1">Bullet Points</label>
      {fields.map((item, bulletIndex) => (
        <div key={item.id} className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-gray-600 shrink-0 mt-1" />
          <textarea
            {...register(`${name}.${nestIndex}.bullets.${bulletIndex}`)}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm min-h-[40px] focus:ring-1 focus:ring-primary"
            rows={2}
          />
          <button onClick={() => remove(bulletIndex)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
        </div>
      ))}
      <button type="button" onClick={() => append("")} className="text-xs text-gray-400 hover:text-primary ml-4 mt-1 flex items-center gap-1"><Plus className="w-3 h-3"/> Add Bullet</button>
    </div>
  );
};
