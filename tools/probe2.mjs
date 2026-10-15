import * as Astronomy from 'astronomy-engine';

function report(label, R) {
  const m = R.rot;
  const pole = Astronomy.RotateVector(R, { x: 0, y: 0, z: 1 });
  console.log(label);
  console.log(m.map((row) => row.map((x) => x.toFixed(6)).join(' ')).join('\n'));
  console.log('  J2000 pole ->', pole.x.toFixed(6), pole.y.toFixed(6), pole.z.toFixed(6));
}

report('Rotation_EQJ_EQD(2026)', Astronomy.Rotation_EQJ_EQD(Astronomy.MakeTime(Date.UTC(2026, 0, 1))));
report('Rotation_EQJ_EQD(1875)', Astronomy.Rotation_EQJ_EQD(Astronomy.MakeTime(Date.UTC(1875, 0, 1, 12))));
report('Rotation_EQJ_EQD(J2000)', Astronomy.Rotation_EQJ_EQD(Astronomy.MakeTime(Date.UTC(2000, 0, 1, 12))));
