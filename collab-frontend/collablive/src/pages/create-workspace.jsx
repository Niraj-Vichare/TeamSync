import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import workspaceService from '@/services/workspace';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function CreateWorkspace() {

  const [workspaceName,setWorkspaceName] = useState('');
  const [workspaceDesc,setWorkspaceDesc] = useState('');
  const navigate = useNavigate();

  const handleCreateWorkspace=()=>{
    try{
      if(workspaceName == ''){
        toast.error("Workspace name is required");
        return;
      }
      var response = workspaceService.createWorkspace(workspaceName,workspaceDesc);
      const { success,data,message,statusCode } = response.data;
      if(success || statusCode == 200){
        toast.success(message || "Workspace created successfully");
        navigate('/workspace/invite-workspace')
      }

    }catch(error){
      toast.error("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side – Branding/Message */}
      <div className="md:w-5/12 bg-muted flex items-center justify-center p-8">
        <div className="max-w-md text-center md:text-left">
          <h1 className="text-3xl font-bold mb-4">Welcome to Flowstate</h1>
          <p className="text-muted-foreground text-lg">
            Create your workspace to begin collaborating with your team.
            Keep everything organized, just like Slack.
          </p>
        </div>
      </div>

      {/* Right Side – Form */}
      <div className="md:w-7/12 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input id="workspace-name" placeholder="e.g., Acme Inc." required value={workspaceName} onChange={(e)=>setWorkspaceName(e.target.value)}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description">Workspace Description <span className="text-muted-foreground text-sm">(optional)</span></Label>
            <Input id="workspace-description" placeholder="e.g., Marketing team collaboration space" value={workspaceDesc} onChange={(e)=>setWorkspaceDesc(e.target.value)}/>
          </div>

          <Button className="w-full" onClick={handleCreateWorkspace}>Next</Button>
        </div>
      </div>
    </div>
  )
}

export default CreateWorkspace;