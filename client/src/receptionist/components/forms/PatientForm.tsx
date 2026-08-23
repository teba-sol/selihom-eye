import { useState } from 'react';
import { api } from '../../lib/api';
import type { Patient } from '../../lib/types';
import { useToast } from '../../store/toast';
import { Button } from '../ui/Button';
import { Input, Field, Select, Textarea } from '../ui/Input';

interface PatientFormProps {
  initial?: Patient | null;
  onDone: (patient: Patient) => void;
  onCancel?: () => void;
}

export function PatientForm({ initial, onDone, onCancel }: PatientFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: initial?.firstName ?? '',
    fatherName: initial?.fatherName ?? '',
    grandfatherName: initial?.grandfatherName ?? '',
    sex: initial?.sex ?? 'male',
    age: initial?.age != null ? String(initial.age) : '',
    phone: initial?.phone ?? '',
    dateOfBirthEthiopian: initial?.dateOfBirthEthiopian ?? '',
    dateOfBirthGregorian: initial?.dateOfBirthGregorian ? initial.dateOfBirthGregorian.slice(0, 10) : '',
    region: initial?.region ?? 'Addis Ababa',
    zone: initial?.zone ?? '',
    woredaOrSubcity: initial?.woredaOrSubcity ?? '',
    kebele: initial?.kebele ?? '',
    ketenaOrGott: initial?.ketenaOrGott ?? '',
    houseNumber: initial?.houseNumber ?? '',
    isDiabetic: initial?.isDiabetic ? 'true' : 'false',
    familyGlaucomaHistory: initial?.familyGlaucomaHistory ? 'true' : 'false',
    priorEyeSurgery: initial?.priorEyeSurgery ?? '',
  });

  const update = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.fatherName.trim()) {
      toast('First name and Father name are required', 'error');
      return;
    }
    if (!form.phone.trim()) {
      toast('Contact phone number is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        firstName: form.firstName.trim(),
        fatherName: form.fatherName.trim(),
        grandfatherName: form.grandfatherName.trim() || undefined,
        sex: form.sex,
        age: form.age ? Number(form.age) : undefined,
        phone: form.phone.trim(),
        region: form.region.trim() || undefined,
        zone: form.zone.trim() || undefined,
        woredaOrSubcity: form.woredaOrSubcity.trim() || undefined,
        kebele: form.kebele.trim() || undefined,
        ketenaOrGott: form.ketenaOrGott.trim() || undefined,
        houseNumber: form.houseNumber.trim() || undefined,
        dateOfBirthEthiopian: form.dateOfBirthEthiopian.trim() || undefined,
        dateOfBirthGregorian: form.dateOfBirthGregorian.trim() || undefined,
        isDiabetic: form.isDiabetic === 'true',
        familyGlaucomaHistory: form.familyGlaucomaHistory === 'true',
        priorEyeSurgery: form.priorEyeSurgery.trim() || undefined,
      };

      let result: Patient;
      if (initial?.id) {
        result = await api.patch<Patient>(`/patients/${initial.id}`, payload);
        toast(`Patient record updated: ${result.firstName} ${result.fatherName}`, 'success');
      } else {
        result = await api.post<Patient>('/patients', payload);
        toast(`Patient registered successfully! MRN: ${result.mrn}`, 'success');
      }

      onDone(result);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save patient', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* 3-part Ethiopian Name */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="First Name" required>
          <Input
            placeholder="e.g. Almaz / Yohannes"
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Father Name" required>
          <Input
            placeholder="e.g. Bekele / Tadesse"
            value={form.fatherName}
            onChange={(e) => update('fatherName', e.target.value)}
          />
        </Field>

        <Field label="Grandfather Name">
          <Input
            placeholder="e.g. Haile / Worku"
            value={form.grandfatherName}
            onChange={(e) => update('grandfatherName', e.target.value)}
          />
        </Field>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Sex" required>
          <Select value={form.sex} onChange={(e) => update('sex', e.target.value)}>
            <option value="male">Male (ወንድ)</option>
            <option value="female">Female (ሴት)</option>
          </Select>
        </Field>

        <Field label="Age (Years)">
          <Input
            type="number"
            min="0"
            max="130"
            placeholder="e.g. 45"
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
          />
        </Field>

        <Field label="Phone Number" required>
          <Input
            type="tel"
            placeholder="e.g. 0911234567"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </Field>
      </div>

      {/* Date of Birth & Calendar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Date of Birth (Ethiopian Calendar)" hint="Format: DD/MM/YYYY E.C.">
          <Input
            placeholder="e.g. 12/04/1975"
            value={form.dateOfBirthEthiopian}
            onChange={(e) => update('dateOfBirthEthiopian', e.target.value)}
          />
        </Field>

        <Field label="Date of Birth (Gregorian)">
          <Input
            type="date"
            value={form.dateOfBirthGregorian}
            onChange={(e) => update('dateOfBirthGregorian', e.target.value)}
          />
        </Field>
      </div>

      {/* Location / Address */}
      <div className="rounded-xl border border-line bg-slate-500/[0.03] p-3.5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Address & Administrative Location
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Region / City Admin">
            <Input
              placeholder="e.g. Addis Ababa"
              value={form.region}
              onChange={(e) => update('region', e.target.value)}
            />
          </Field>

          <Field label="Subcity / Zone">
            <Input
              placeholder="e.g. Bole / Kirkos / Yeka"
              value={form.zone}
              onChange={(e) => update('zone', e.target.value)}
            />
          </Field>

          <Field label="Woreda">
            <Input
              placeholder="e.g. Woreda 03"
              value={form.woredaOrSubcity}
              onChange={(e) => update('woredaOrSubcity', e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Kebele">
            <Input
              placeholder="e.g. Kebele 08"
              value={form.kebele}
              onChange={(e) => update('kebele', e.target.value)}
            />
          </Field>

          <Field label="Ketena / Gott">
            <Input
              placeholder="e.g. Ketena 2"
              value={form.ketenaOrGott}
              onChange={(e) => update('ketenaOrGott', e.target.value)}
            />
          </Field>

          <Field label="House Number">
            <Input
              placeholder="e.g. 1420 / New"
              value={form.houseNumber}
              onChange={(e) => update('houseNumber', e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Clinical Risk Indicators */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Diabetic Status">
          <Select value={form.isDiabetic} onChange={(e) => update('isDiabetic', e.target.value)}>
            <option value="false">Non-Diabetic</option>
            <option value="true">Known Diabetic (High DR Risk)</option>
          </Select>
        </Field>

        <Field label="Family Glaucoma History">
          <Select
            value={form.familyGlaucomaHistory}
            onChange={(e) => update('familyGlaucomaHistory', e.target.value)}
          >
            <option value="false">No reported history</option>
            <option value="true">Yes (First-degree relative)</option>
          </Select>
        </Field>
      </div>

      <Field label="Prior Ocular Surgeries / Laser">
        <Textarea
          placeholder="e.g. OD Cataract Extracapsular with IOL (2022); OS Laser Iridotomy (2024)"
          value={form.priorEyeSurgery}
          onChange={(e) => update('priorEyeSurgery', e.target.value)}
          className="min-h-[60px]"
        />
      </Field>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading}>
          {initial ? 'Update Demographics' : 'Complete Registration'}
        </Button>
      </div>
    </form>
  );
}
