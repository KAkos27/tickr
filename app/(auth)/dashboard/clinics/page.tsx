import ClinicManager from "@/components/clinic-manager";
import { createClinic, inviteClinicMember } from "@/lib/actions";
import { getActiveClinic, getUserClinics } from "@/lib/querys";

export default async function ClinicsPage() {
  const clinics = await getUserClinics();
  const activeClinic = await getActiveClinic();

  const clinicSummaries = clinics.map((membership) => ({
    clinicId: membership.clinicId,
    clinicName: membership.clinic.name,
  }));

  return (
    <ClinicManager
      clinics={clinicSummaries}
      activeClinicId={activeClinic?.id ?? null}
      createClinicAction={createClinic}
      inviteClinicMemberAction={inviteClinicMember}
    />
  );
}
