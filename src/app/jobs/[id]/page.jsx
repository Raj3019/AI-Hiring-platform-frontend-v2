"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jobsAPI } from "@/lib/api";
import { NeoCard, NeoBadge, NeoButton } from "@/components/ui/neo";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    jobsAPI.getById(params.id)
      .then(res => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const formatSalary = (salary) => {
    if (!salary) return "";
    if (typeof salary === "object") {
      return `${salary.min} - ${salary.max} ${salary.currency}`;
    }
    return salary;
  };

  if (loading) {
    return <div className="container mx-auto py-12">Loading...</div>;
  }
  if (!job) {
    return <div className="container mx-auto py-12 text-red-600 font-bold">Job not found.</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <Link href="/jobs" className="mb-6 flex items-center font-bold text-neo-black hover:underline group">
        <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> Back to Jobs
      </Link>
      <NeoCard className="p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2">{job.title}</h1>
            <NeoBadge>{job.jobType}</NeoBadge>
            <p className="text-lg font-bold text-gray-700 mb-2">{job.companyName}</p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-500 mb-4">
              <span>{job.location}</span>
              <span>{formatSalary(job.salary)}</span>
            </div>
          </div>
        </div>
        <p className="mb-4 text-gray-800">{job.description}</p>
        <div className="mb-4">
          <h3 className="font-bold mb-2">Skills Required:</h3>
          <div className="flex gap-2 flex-wrap">
            {job.skillsRequired?.map((req) => (
              <span key={req} className="bg-gray-200 px-2 py-1 text-xs font-bold border border-neo-black">{req}</span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-bold mb-2">About the Role:</h3>
          <p>{job.description}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold mb-2">Benefits:</h3>
          <div className="flex gap-2 flex-wrap">
            {job.benefits?.map((benefit) => (
              <span key={benefit} className="bg-gray-100 px-2 py-1 text-xs font-bold border border-neo-black">{benefit}</span>
            ))}
          </div>
        </div>
      </NeoCard>
    </div>
  );
}
